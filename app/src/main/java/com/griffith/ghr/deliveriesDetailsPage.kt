package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
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
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

// Data class for Delivery Details
data class DeliveryDetails(
    val arrivedAt: String?,
    val sender: String?,
    val parcelType: String?,
    val description: String?,
    val collectedAt: String?
)

// Retrofit API interface for Delivery Details
interface DeliveryDetailsApi {
    @POST("api/deliveries")
    suspend fun getDeliveryDetails(
        @Header("Authorization") token: String,
        @Body request: Map<String, String>
    ): DeliveryDetails
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeliveryDetailsPage(navController: NavController, parcelNumber: String) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // State for delivery details
    var arrivedAt by remember { mutableStateOf("-") }
    var sender by remember { mutableStateOf("-") }
    var parcelType by remember { mutableStateOf("-") }
    var description by remember { mutableStateOf("-") }
    var collectedAt by remember { mutableStateOf("-") }

    // Initialize Retrofit
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val deliveryDetailsApi = retrofit.create(DeliveryDetailsApi::class.java)

    // Fetch delivery details on first composition
    LaunchedEffect(parcelNumber) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            scope.launch {
                try {
                    val delivery = deliveryDetailsApi.getDeliveryDetails(
                        token = "Bearer $token",
                        request = mapOf("parcelNumber" to parcelNumber)
                    )
                    arrivedAt = delivery.arrivedAt ?: "-"
                    sender = delivery.sender ?: "-"
                    parcelType = delivery.parcelType ?: "-"
                    description = delivery.description ?: "-"
                    collectedAt = delivery.collectedAt ?: "-"
                } catch (e: Exception) {
                    Log.e("DeliveryDetailsPage", "Error fetching delivery details", e)
                    Toast.makeText(
                        context,
                        "Failed to fetch delivery details. Please try again.",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        } else {
            Toast.makeText(
                context,
                "No authentication token found. Please log in again.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    // UI content remains unchanged
    Box(modifier = Modifier.fillMaxSize()) {
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
                    AppHeader(
                        onMenuClick = {
                            scope.launch { menuDrawerState.open() }
                        },
                        onNotificationClick = {
                            isNotificationDrawerOpen.value = true
                        },
                        navController = navController,
                        showBackButton = true
                    )
                },
                content = { innerPadding ->
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Top,
                        horizontalAlignment = Alignment.Start
                    ) {
                        Spacer(modifier = Modifier.height(16.dp))

                        // Parcel Number
                        Text(
                            text = "Parcel NO.",
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
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
                                        color = Color.Black
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(32.dp))

                        // Delivery Details
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
            )
        }

        if (isNotificationDrawerOpen.value) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.5f))
                    .clickable { isNotificationDrawerOpen.value = false }
            )
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .width((2 * LocalConfiguration.current.screenWidthDp / 3).dp)
                    .align(Alignment.TopEnd)
                    .background(Color.White, RoundedCornerShape(topStart = 16.dp, bottomStart = 16.dp))
            ) {
                NotificationDrawerBox()
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
