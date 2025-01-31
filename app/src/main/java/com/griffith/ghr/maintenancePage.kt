package com.griffith.ghr

import android.content.Context
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
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
fun MaintenancePage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    // State for notification drawer
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // State for the selected tab
    val selectedTabIndex = remember { mutableStateOf(0) }
    val tabs = listOf("In Progress", "Completed")

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
                                isNotificationDrawerOpen.value = true
                            },
                            navController = navController,
                            showBackButton = true  // Show back button for navigation
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
                    MaintenancePageContent(
                        navController = navController,
                        innerPadding = innerPadding,
                        selectedTab = selectedTabIndex.value
                    )
                },
                bottomBar = {
                    FooterButton(
                        navController = navController,
                        buttonText = "Create Request",
                        navigateTo = "MaintenanceRequestPage"
                    )
                }
            )
        }

        // Notification Drawer Overlay
        if (isNotificationDrawerOpen.value) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.5f))
                    .clickable {
                        isNotificationDrawerOpen.value = false
                    }
            )
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .width((2 * LocalConfiguration.current.screenWidthDp / 3).dp)
                    .align(Alignment.TopEnd)
                    .background(Color.White, shape = RoundedCornerShape(topStart = 16.dp, bottomStart = 16.dp))
            ) {
                NotificationDrawerBox()
            }
        }
    }
}

@Composable
fun MaintenancePageContent(
    navController: NavController,
    innerPadding: PaddingValues,
    selectedTab: Int
) {
    val maintenanceRequests = remember { mutableStateListOf<MaintenanceRequest>() }
    val context = LocalContext.current
    var userRoomNumber by remember { mutableStateOf<String?>(null) }

    // Retrofit setup
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com") // Replace with your backend URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val maintenanceApi = retrofit.create(MaintenanceApi::class.java)
    val userApi = retrofit.create(UserProfileApi::class.java)

    // Fetch user's room number and maintenance requests
    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            try {
                // Fetch user profile to get room number
                val userProfile = userApi.getUserProfile("Bearer $token")
                userRoomNumber = userProfile.roomNumber

                // Fetch all maintenance requests
                val allRequests = maintenanceApi.getMaintenanceRequests("Bearer $token")
                maintenanceRequests.clear()
                maintenanceRequests.addAll(allRequests) // Add all requests to the list
            } catch (e: Exception) {
                Log.e("MaintenancePageContent", "Error fetching data: ${e.message}")
            }
        }
    }

    // Filter maintenance requests based on room number and selected tab
    val filteredRequests = maintenanceRequests.filter { request ->
        request.roomNumber == userRoomNumber && when (selectedTab) {
            0 -> request.status == "In Process"
            1 -> request.status == "Completed"
            else -> false
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(innerPadding)
    ) {
        if (filteredRequests.isEmpty()) {
            Column(
                modifier = Modifier.align(Alignment.Center), // Center content in the Box
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.maintenance),
                    contentDescription = "No Requests",
                    tint = Color.Gray,
                    modifier = Modifier.size(48.dp) // Adjust icon size
                )

                Spacer(modifier = Modifier.height(8.dp)) // Space between icon and text

                Text(
                    text = "No maintenance requests to display",
                    fontSize = 16.sp,
                    color = Color.Gray
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                filteredRequests.forEach() { request ->
                    item{
                        MaintenanceCard(
                            navController = navController,
                            request = request
                        )
                    }
                }
            }
        }
    }
}


// Retrofit API interface for maintenance requests
interface MaintenanceApi {
    @GET("api/maintenance/")
    suspend fun getMaintenanceRequests(@Header("Authorization") token: String): List<MaintenanceRequest>
}



data class MaintenanceRequest(
    val requestId: String,
    val roomNumber: String,
    val category: String,
    val description: String,
    val roomAccess: String,
    val pictures: List<String>,
    val status: String,
    val createdAt: String,
    val completedAt: String?
)

@Composable
fun MaintenanceCard(navController: NavController, request: MaintenanceRequest) {
    // Format the date and time
    val formattedDateTime = remember(request.createdAt) {
        try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()) // Assuming ISO format
            val outputFormat = SimpleDateFormat("EEE, dd MMM yyyy, HH:mm", Locale.getDefault()) // Date with time
            val date = inputFormat.parse(request.createdAt)
            outputFormat.format(date ?: request.createdAt)
        } catch (e: Exception) {
            request.createdAt // Fallback to original if parsing fails
        }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clickable {
                navController.navigate("MaintenanceRequestDetailsPage/${request.requestId}")
            },
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
        ) {
            // Top Section: Request ID and Status
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Request ID
                Text(
                    text = "Request ID: ${request.requestId}",
                    fontSize = 12.sp,
                    color = Color.Gray
                )

                // Status
                Box(
                    modifier = Modifier
                        .background(
                            color = when (request.status) {
                                "In Progress" -> Color(0xFF1976D2) // Blue
                                "Completed" -> Color(0xFF4CAF50) // Green
                                else -> Color(0xFFF44336) // Red
                            },
                            shape = RoundedCornerShape(12.dp)
                        )
                        .padding(horizontal = 12.dp, vertical = 4.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = request.status,
                        fontSize = 12.sp,
                        color = Color.White
                    )
                }
            }

            // Main Section: Category
            Text(
                text = request.category,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .padding(horizontal = 16.dp)
                    .padding(bottom = 8.dp)
            )

            // Bottom Section: Date and Time
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF5F5F5)) // Light grey background
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                Text(
                    text = formattedDateTime,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
        }
    }
}
