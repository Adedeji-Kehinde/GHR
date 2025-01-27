package com.griffith.ghr

import android.content.Context
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
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

@Composable
fun DeliveriesPage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    // State for notification drawer
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // State for the selected tab
    val selectedTabIndex = remember { mutableStateOf(0) }
    val tabs = listOf("To Collect", "Collected", "Cancelled")

    Box(modifier = Modifier.fillMaxSize()) {
        // Main Content with Menu Drawer
        ModalNavigationDrawer(
            drawerState = menuDrawerState,
            drawerContent = {
                ModalDrawerSheet {
                    MenuDrawerContent(navController = navController)
                }
            },
            modifier = Modifier.fillMaxSize()
        ) {
            Scaffold(
                topBar = {
                    Column {
                        AppHeader(
                            onMenuClick = {
                                scope.launch {
                                    menuDrawerState.open() // Open the menu drawer
                                }
                            },
                            onNotificationClick = {
                                // Open the notification drawer
                                isNotificationDrawerOpen.value = true
                            },
                            navController = navController,
                            showBackButton = true,  // Show back button for navigation
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
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.5f)) // Dim background
                    .clickable {
                        isNotificationDrawerOpen.value = false // Close drawer when background is clicked
                    }
            )
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .width((2 * LocalConfiguration.current.screenWidthDp / 3).dp) // 2/3 width
                    .align(Alignment.TopEnd)
                    .background(Color.White, shape = RoundedCornerShape(topStart = 16.dp, bottomStart = 16.dp)) // Apply rounded corners only on the left side
            ) {
                NotificationDrawerBox()
            }
        }
    }
}

// Retrofit API interface
interface DeliveryApi {
    @GET("api/auth/deliveries") // Replace with your backend endpoint
    suspend fun getDeliveries(@Header("Authorization") token: String): List<Delivery>
}

@Composable
fun DeliveriesPageContent(
    navController: NavController,
    innerPadding: PaddingValues,
    selectedTab: Int
) {
    val deliveries = remember { mutableStateListOf<Delivery>() }
    val context = LocalContext.current

    // Retrofit setup
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com") // Replace with your backend URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val deliveryApi = retrofit.create(DeliveryApi::class.java)

    // Fetch all deliveries
    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            try {
                val allDeliveries = deliveryApi.getDeliveries("Bearer $token")
                deliveries.clear()
                deliveries.addAll(allDeliveries) // Add all deliveries to the list
            } catch (e: Exception) {
                Log.e("DeliveriesPageContent", "Error fetching deliveries: ${e.message}")
            }
        }
    }

    // Filter deliveries based on the selected tab
    val filteredDeliveries = when (selectedTab) {
        0 -> deliveries.filter { it.status == "To Collect" }
        1 -> deliveries.filter { it.status == "Collected" }
        2 -> deliveries.filter { it.status == "Cancelled" }
        else -> emptyList()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(innerPadding)
    ) {
        if (filteredDeliveries.isEmpty()) {
            Text(
                text = "No deliveries to display",
                fontSize = 16.sp,
                color = Color.Gray,
                modifier = Modifier.align(Alignment.Center)
            )
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp)
            ) {
                filteredDeliveries.forEach { delivery ->
                    DeliveryCard(navController = navController, delivery = delivery)
                    Spacer(modifier = Modifier.height(8.dp)) // Add spacing between cards
                }
            }
        }
    }
}

@Composable
fun DeliveryCard(navController: NavController, delivery: Delivery) {
    // Format the date and time
    val formattedDateTime = remember(delivery.arrivedAt) {
        try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()) // Assuming ISO format
            val outputFormat = SimpleDateFormat("EEE, dd MMM yyyy, HH:mm", Locale.getDefault()) // Date with time
            val date = inputFormat.parse(delivery.arrivedAt)
            outputFormat.format(date ?: delivery.arrivedAt)
        } catch (e: Exception) {
            delivery.arrivedAt // Fallback to original if parsing fails
        }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp) // Add top and bottom padding
            .clickable { // Navigate to DeliveryDetailsPage with parcel details
                navController.navigate("DeliveryDetailsPage/${delivery.parcelNumber}")
            },
        shape = RoundedCornerShape(8.dp), // Rounded rectangle shape
        elevation = CardDefaults.cardElevation(4.dp), // Add elevation for shadow
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left Column: Delivery Details
            Column(
                modifier = Modifier.weight(1f) // Take up available space
            ) {
                // Display formatted date and time
                Text(
                    text = formattedDateTime, // Use the formatted date and time
                    fontSize = 14.sp, // Adjusted font size
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )
                // Parcel type below
                Text(
                    text = delivery.parcelType, // Parcel type (e.g., Letter, Package)
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }

            Spacer(modifier = Modifier.width(8.dp)) // Add space between columns

            // Right Column: Parcel Number
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                delivery.parcelNumber.chunked(1).forEach { digit ->
                    Box(
                        modifier = Modifier
                            .width(28.dp)
                            .height(40.dp)
                            .background(Color.White, shape = RoundedCornerShape(4.dp))
                            .border(1.dp, Color.Gray, shape = RoundedCornerShape(4.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = digit,
                            fontSize = 14.sp,
                            color = Color.Black
                        )
                    }
                    Spacer(modifier = Modifier.width(4.dp)) // Space between digit boxes
                }
            }
        }
    }
}

data class Delivery(
    val arrivedAt: String, // Date as a string or formatted datetime
    val parcelType: String, // Type of parcel: Letter or Package
    val parcelNumber: String, // Parcel number as a string
    val status: String // Status of the parcel: To Collect, Collected, or Cancelled
)
