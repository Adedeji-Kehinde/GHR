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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaintenanceRequestDetailsPage(navController: NavController, requestId: String) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // State for maintenance details
    var roomNumber by remember { mutableStateOf("-") }
    var category by remember { mutableStateOf("-") }
    var description by remember { mutableStateOf("-") }
    var roomAccess by remember { mutableStateOf("-") }
    var status by remember { mutableStateOf("-") }
    var completedAt by remember { mutableStateOf("-") }
    var pictures by remember { mutableStateOf<List<String>>(emptyList()) }

    // Retrofit setup
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com") // Update with your backend URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val maintenanceApi = retrofit.create(MaintenanceApi::class.java)

    // Fetch maintenance requests and find the matching one
    LaunchedEffect(requestId) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            scope.launch {
                try {
                    val maintenanceRequests = maintenanceApi.getMaintenanceRequests("Bearer $token")
                    val matchingRequest = maintenanceRequests.find { it.requestId == requestId }

                    if (matchingRequest != null) {
                        roomNumber = matchingRequest.roomNumber
                        category = matchingRequest.category
                        description = matchingRequest.description
                        roomAccess = matchingRequest.roomAccess
                        status = matchingRequest.status
                        completedAt = matchingRequest.completedAt?.let { formatDateTime(it) } ?: "-"
                        pictures = matchingRequest.pictures
                    } else {
                        Toast.makeText(
                            context,
                            "Maintenance request not found.",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                } catch (e: Exception) {
                    Log.e("MaintenanceDetailsPage", "Error fetching maintenance requests", e)
                    Toast.makeText(
                        context,
                        "Failed to fetch maintenance details. Please try again.",
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

                        // Request ID and Status
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Request ID: $requestId",
                                fontSize = 14.sp,
                                color = Color.Gray
                            )
                            Box(
                                modifier = Modifier
                                    .background(
                                        color = when (status) {
                                            "In Process" -> Color.Blue
                                            "Completed" -> Color.Green
                                            else -> Color.Gray
                                        },
                                        shape = RoundedCornerShape(16.dp)
                                    )
                                    .padding(horizontal = 16.dp, vertical = 8.dp)
                            ) {
                                Text(
                                    text = status,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(32.dp))

                        // Maintenance Details
                        MaintenanceDetailRow(label = "Room Number", value = roomNumber)
                        Spacer(modifier = Modifier.height(16.dp))
                        MaintenanceDetailRow(label = "Category", value = category)
                        Spacer(modifier = Modifier.height(16.dp))
                        MaintenanceDetailRow(label = "Description", value = description)
                        Spacer(modifier = Modifier.height(16.dp))
                        MaintenanceDetailRow(label = "Room Access", value = roomAccess)
                        Spacer(modifier = Modifier.height(16.dp))
                        MaintenanceDetailRow(label = "Completed At", value = completedAt)

                        Spacer(modifier = Modifier.height(32.dp))

                        // Attachments
                        Text(
                            text = "Attachments",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Spacer(modifier = Modifier.height(16.dp))

                        if (pictures.isEmpty()) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(100.dp)
                                    .background(Color.LightGray, shape = RoundedCornerShape(8.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "No Attachments Available",
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )
                            }
                        } else {
                            Column {
                                pictures.forEach { picture ->
                                    Text(text = picture, color = Color.Blue)
                                }
                            }
                        }
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
fun MaintenanceDetailRow(label: String, value: String) {
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
                .fillMaxWidth(0.5f)
        ) {
            Text(
                text = value,
                fontSize = 16.sp,
                fontWeight = FontWeight.Normal,
                color = Color.Black
            )
        }
    }
}
