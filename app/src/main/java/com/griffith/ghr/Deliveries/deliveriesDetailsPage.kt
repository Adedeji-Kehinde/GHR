package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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

// ------------------------- DELIVERY DETAILS PAGE -------------------------

/**
 * DeliveryDetailsPage - Displays detailed information about a specific delivery.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeliveryDetailsPage(navController: NavController, parcelNumber: String) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // Drawer states
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // Delivery details state
    var deliveryDetails by remember { mutableStateOf<Delivery?>(null) }

    // Retrofit setup
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val deliveryDetailsApi = retrofit.create(DeliveryApi::class.java)

    // Fetch delivery details
    LaunchedEffect(parcelNumber) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            scope.launch {
                try {
                    val deliveries = deliveryDetailsApi.getDeliveries("Bearer $token")
                    deliveryDetails = deliveries.find { it.parcelNumber == parcelNumber }

                    if (deliveryDetails == null) {
                        Toast.makeText(context, "Delivery not found.", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    Log.e("DeliveryDetailsPage", "Error fetching deliveries", e)
                    Toast.makeText(context, "Failed to fetch delivery details.", Toast.LENGTH_LONG).show()
                }
            }
        } else {
            Toast.makeText(context, "No authentication token found. Please log in again.", Toast.LENGTH_LONG).show()
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        ModalNavigationDrawer(
            drawerState = menuDrawerState,
            drawerContent = { ModalDrawerSheet { MenuDrawerContent(navController) } },
            modifier = Modifier.fillMaxSize()
        ) {
            Scaffold(
                topBar = {
                    AppHeader(
                        onMenuClick = { scope.launch { menuDrawerState.open() } },
                        onNotificationClick = { isNotificationDrawerOpen.value = true },
                        navController = navController,
                        showBackButton = true
                    )
                },
                content = { innerPadding ->
                    DeliveryDetailsContent(
                        parcelNumber = parcelNumber,
                        deliveryDetails = deliveryDetails,
                        innerPadding = innerPadding
                    )
                }
            )
        }

        if (isNotificationDrawerOpen.value) {
            NotificationDrawerOverlay(isNotificationDrawerOpen)
        }
    }
}

// ------------------------- DELIVERY DETAILS CONTENT -------------------------

/**
 * DeliveryDetailsContent - Displays the content inside the Delivery Details Page.
 */
@Composable
fun DeliveryDetailsContent(parcelNumber: String, deliveryDetails: Delivery?, innerPadding: PaddingValues) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(innerPadding)
            .padding(16.dp),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.Start
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Parcel Number and Status
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = "Parcel NO.", fontSize = 14.sp, color = Color.Gray)
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    parcelNumber.forEach { digit ->
                        Box(
                            modifier = Modifier
                                .size(36.dp, 48.dp)
                                .background(Color.LightGray, RoundedCornerShape(4.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = digit.toString(),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                        }
                    }
                }
            }

            // Status badge
            Box(
                modifier = Modifier
                    .background(
                        color = when (deliveryDetails?.status) {
                            "To Collect" -> Color.Blue
                            "Collected" -> Color.Green
                            "Cancelled" -> Color.Red
                            else -> Color.Gray
                        },
                        shape = RoundedCornerShape(16.dp)
                    )
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Text(
                    text = deliveryDetails?.status ?: "-",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Delivery Details
        DeliveryDetailRow(label = "Arrived at", value = deliveryDetails?.arrivedAt?.let { formatDateTime(it) })
        DeliveryDetailRow(label = "Sender", value = deliveryDetails?.sender)
        DeliveryDetailRow(label = "Parcel Type", value = deliveryDetails?.parcelType)
        DeliveryDetailRow(label = "Description", value = deliveryDetails?.description)
        DeliveryDetailRow(label = "Collected at", value = deliveryDetails?.collectedAt?.let { formatDateTime(it) })
    }
}

// ------------------------- HELPER COMPOSABLES -------------------------

/**
 * DeliveryDetailRow - A reusable row for displaying a label and its corresponding value.
 */
@Composable
fun DeliveryDetailRow(label: String, value: String?) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, fontSize = 16.sp, fontWeight = FontWeight.Medium, color = Color.Gray, modifier = Modifier.weight(1f))
        Box(modifier = Modifier.fillMaxWidth(0.5f)) {
            Text(text = value ?: "-", fontSize = 16.sp, fontWeight = FontWeight.Normal, color = MaterialTheme.colorScheme.onBackground)
        }
    }
}