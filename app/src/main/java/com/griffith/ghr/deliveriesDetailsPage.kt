package com.griffith.ghr

import android.content.Context
import android.util.Log
import androidx.compose.foundation.background
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
import retrofit2.http.Path

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeliveryDetailsPage(navController: NavController, parcelNumber: String) {
    val scope = rememberCoroutineScope()

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    // State for notification drawer
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // States for delivery details
    var arrivedAt by remember { mutableStateOf<String?>(null) }
    var sender by remember { mutableStateOf<String?>(null) }
    var parcelType by remember { mutableStateOf<String?>(null) }
    var description by remember { mutableStateOf<String?>(null) }
    var collectedAt by remember { mutableStateOf<String?>(null) }

    val context = LocalContext.current

    // Retrofit setup
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com") // Replace with your backend URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val deliveryApi = retrofit.create(DeliveryApi::class.java)

    // Fetch delivery details on page load
    LaunchedEffect(parcelNumber) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            try {
                val delivery = deliveryApi.getDeliveryDetails("Bearer $token", parcelNumber)
                arrivedAt = delivery.arrivedAt
                sender = delivery.sender
                parcelType = delivery.parcelType
                description = delivery.description
                collectedAt = delivery.collectedAt
            } catch (e: Exception) {
                Log.e("DeliveryDetailsPage", "Error fetching delivery details: ${e.message}")
            }
        }
    }

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
                            showBackButton = true // Show back button for navigation
                        )
                    }
                },
                content = { innerPadding ->
                    DeliveryDetailsContent(
                        innerPadding = innerPadding,
                        parcelNumber = parcelNumber,
                        arrivedAt = arrivedAt,
                        sender = sender,
                        parcelType = parcelType,
                        description = description,
                        collectedAt = collectedAt
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
    @GET("api/delivery/{parcelNumber}") // Backend endpoint for fetching delivery details
    suspend fun getDeliveryDetails(
        @Header("Authorization") token: String,
        @Path("parcelNumber") parcelNumber: String
    ): DeliveryDetails
}

// Data class for delivery details
data class DeliveryDetails(
    val arrivedAt: String?, // Date as a string or formatted datetime
    val sender: String?,
    val parcelType: String?,
    val description: String?,
    val collectedAt: String?
)


@Composable
fun DeliveryDetailsContent(
    innerPadding: PaddingValues,
    parcelNumber: String,
    arrivedAt: String?,
    sender: String?,
    parcelType: String?,
    description: String?,
    collectedAt: String?
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(innerPadding)
            .padding(top = 16.dp) // Ensure content starts below app header
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp) // Padding on the sides
        ) {
            // "Parcel NO." Label and Number Boxes
            Text(
                text = "Parcel NO.",
                fontSize = 14.sp,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.wrapContentSize()
            ) {
                parcelNumber.forEach { digit ->
                    Box(
                        modifier = Modifier
                            .size(36.dp, 48.dp)
                            .background(Color.LightGray, shape = RoundedCornerShape(4.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = digit.toString(),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp)) // Space between Parcel NO. and details

            // Delivery Details Section
            Column(modifier = Modifier.fillMaxWidth()) {
                DeliveryDetailRow(label = "Arrived at", value = arrivedAt)
                Spacer(modifier = Modifier.height(16.dp))
                DeliveryDetailRow(label = "Sender", value = sender)
                Spacer(modifier = Modifier.height(16.dp))
                DeliveryDetailRow(label = "Parcel Type", value = parcelType)
                Spacer(modifier = Modifier.height(16.dp))
                DeliveryDetailRow(label = "Description", value = description)
                Spacer(modifier = Modifier.height(16.dp))
                DeliveryDetailRow(label = "Collected at", value = collectedAt)
            }
        }
    }
}

@Composable
fun DeliveryDetailRow(label: String, value: String?) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            color = Color.Gray,
            modifier = Modifier.weight(1f)
        )
        Box(
            modifier = Modifier
                .fillMaxWidth(0.5f) // Ensures alignment across all rows
        ) {
            Text(
                text = value ?: "-", // Show dash if data is missing
                fontSize = 16.sp,
                fontWeight = FontWeight.Normal,
                color = Color.Black
            )
        }
    }
}
