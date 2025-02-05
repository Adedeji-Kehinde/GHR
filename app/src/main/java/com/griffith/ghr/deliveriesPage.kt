package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Header
import java.text.SimpleDateFormat
import java.util.Locale

// ------------------------- API INTERFACE -------------------------

/**
 * Delivery API interface for fetching user deliveries.
 */
interface DeliveryApi {
    @GET("api/auth/deliveries")
    suspend fun getDeliveries(@Header("Authorization") token: String): List<Delivery>
}

// ------------------------- DATA MODEL -------------------------

/**
 * Data class representing a delivery item.
 */
data class Delivery(
    val arrivedAt: String,
    val parcelType: String,
    val parcelNumber: String,
    val status: String,
    val roomNumber: String,
    val sender: String?,
    val description: String?,
    val collectedAt: String?
)

// ------------------------- DELIVERIES PAGE -------------------------

/**
 * DeliveriesPage - Displays the user's deliveries categorized by status.
 */
@Composable
fun DeliveriesPage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // Drawer States
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // Tab Navigation State
    val selectedTabIndex = remember { mutableStateOf(0) }
    val tabs = listOf("To Collect", "Collected", "Cancelled")

    Box(modifier = Modifier.fillMaxSize()) {
        // Menu Drawer with Main Content
        ModalNavigationDrawer(
            drawerState = menuDrawerState,
            drawerContent = { ModalDrawerSheet { MenuDrawerContent(navController) } },
            modifier = Modifier.fillMaxSize()
        ) {
            Scaffold(
                topBar = {
                    Column {
                        // App Header with Menu & Notifications
                        AppHeader(
                            onMenuClick = { scope.launch { menuDrawerState.open() } },
                            onNotificationClick = { isNotificationDrawerOpen.value = true },
                            navController = navController,
                            showBackButton = true
                        )

                        // Tab Navigation
                        TabRow(
                            selectedTabIndex = selectedTabIndex.value,
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White
                        ) {
                            tabs.forEachIndexed { index, title ->
                                Tab(
                                    selected = selectedTabIndex.value == index,
                                    onClick = { selectedTabIndex.value = index },
                                    text = { Text(title) }
                                )
                            }
                        }
                    }
                },
                content = { innerPadding ->
                    DeliveriesPageContent(
                        navController = navController,
                        innerPadding = innerPadding,
                        selectedTab = selectedTabIndex.value
                    )
                }
            )
        }

        // Notification Drawer Overlay
        if (isNotificationDrawerOpen.value) {
            NotificationDrawerOverlay(isNotificationDrawerOpen)
        }
    }
}

// ------------------------- DELIVERIES PAGE CONTENT -------------------------

/**
 * DeliveriesPageContent - Displays deliveries based on the selected tab.
 */
@Composable
fun DeliveriesPageContent(
    navController: NavController,
    innerPadding: PaddingValues,
    selectedTab: Int
) {
    val deliveries = remember { mutableStateListOf<Delivery>() }
    val context = LocalContext.current
    var userRoomNumber by remember { mutableStateOf<String?>(null) }

    // Fetch user room number and deliveries (same as before)
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val deliveryApi = retrofit.create(DeliveryApi::class.java)
    val userApi = retrofit.create(UserProfileApi::class.java)

    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            try {
                val userProfile = userApi.getUserProfile("Bearer $token")
                userRoomNumber = userProfile.roomNumber

                val allDeliveries = deliveryApi.getDeliveries("Bearer $token")
                deliveries.clear()
                deliveries.addAll(allDeliveries)
            } catch (e: Exception) {
                Log.e("DeliveriesPageContent", "Error fetching data: ${e.message}")
            }
        }
    }

    val filteredDeliveries = deliveries.filter { delivery ->
        delivery.roomNumber == userRoomNumber && when (selectedTab) {
            0 -> delivery.status == "To Collect"
            1 -> delivery.status == "Collected"
            2 -> delivery.status == "Cancelled"
            else -> false
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(innerPadding)
    ) {
        if (filteredDeliveries.isEmpty()) {
            EmptyPageMessage(
                icon = R.drawable.deliveries,
                message = "No deliveries to display"
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                filteredDeliveries.forEach { delivery ->
                    item { DeliveryCard(navController, delivery) }
                }
            }
        }
    }
}


// ------------------------- DELIVERY CARD -------------------------

/**
 * DeliveryCard - Displays individual delivery details in a card format.
 */
@Composable
fun DeliveryCard(navController: NavController, delivery: Delivery) {
    val context = LocalContext.current

    val formattedDateTime = remember(delivery.arrivedAt) {
        try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            val outputFormat = SimpleDateFormat("EEE, dd MMM yyyy, HH:mm", Locale.getDefault())
            val date = inputFormat.parse(delivery.arrivedAt)
            outputFormat.format(date ?: delivery.arrivedAt)
        } catch (e: Exception) {
            Log.e("DeliveryCard", "Error formatting date", e)
            Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_LONG).show()
            delivery.arrivedAt // Fallback to original date
        }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clickable { navController.navigate("DeliveryDetailsPage/${delivery.parcelNumber}") },
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = formattedDateTime, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color.Black)
                Text(text = delivery.parcelType, fontSize = 12.sp, color = Color.Gray)
            }

            Spacer(modifier = Modifier.width(8.dp))

            ParcelNumberBox(delivery.parcelNumber)
        }
    }
}


// ------------------------- HELPER COMPOSABLE -------------------------

/**
 * ParcelNumberBox - Displays the parcel number in a box layout.
 */
@Composable
fun ParcelNumberBox(parcelNumber: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        parcelNumber.chunked(1).forEach { digit ->
            Box(
                modifier = Modifier
                    .width(28.dp)
                    .height(40.dp)
                    .background(Color.White, shape = RoundedCornerShape(4.dp))
                    .border(1.dp, Color.Gray, shape = RoundedCornerShape(4.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = digit, fontSize = 14.sp, color = Color.Black)
            }
            Spacer(modifier = Modifier.width(4.dp))
        }
    }
}
