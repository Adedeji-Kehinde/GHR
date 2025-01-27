package com.griffith.ghr

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch


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
                    MaintenancePageContent(
                        navController = navController,
                        innerPadding = innerPadding,
                        selectedTab = selectedTabIndex.value
                    )
                },
                bottomBar = {
                    FooterButton(
                        navController = navController,
                        buttonText = "Create Request", // Adapts to text length
                        navigateTo = "MaintenanceRequestPage" // Define the page to navigate
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


data class MaintenanceRequest(
    val requestId: String,
    val category: String,
    val status: String,
    val dateTime: String
)

@Composable
fun MaintenancePageContent(
    navController: NavController,
    innerPadding: PaddingValues,
    selectedTab: Int
) {
    val dummyRequests = listOf(
        MaintenanceRequest("001", "Plumbing Issue", "In Progress", "Mon, 25 Jan 2025, 10:30"),
        MaintenanceRequest("002", "Electrical Issue", "Completed", "Tue, 26 Jan 2025, 14:00"),
        MaintenanceRequest("003", "HVAC Issue", "In Progress", "Wed, 27 Jan 2025, 09:15"),
        MaintenanceRequest("004", "Pest Control", "In Progress", "Thu, 28 Jan 2025, 11:45"),
        MaintenanceRequest("005", "Painting", "Completed", "Fri, 29 Jan 2025, 16:20"),
        MaintenanceRequest("006", "Roof Repair", "In Progress", "Sat, 30 Jan 2025, 08:10"),
        MaintenanceRequest("007", "Floor Replacement", "Completed", "Sun, 31 Jan 2025, 12:00"),
        MaintenanceRequest("008", "Window Replacement", "In Progress", "Mon, 01 Feb 2025, 10:45"),
        MaintenanceRequest("009", "Door Repair", "Completed", "Tue, 02 Feb 2025, 14:30"),
        MaintenanceRequest("010", "Ceiling Repair", "In Progress", "Wed, 03 Feb 2025, 09:50")
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(innerPadding)
    ) {
        if (dummyRequests.isEmpty()) {
            Text(
                text = "No maintenance requests to display",
                fontSize = 16.sp,
                color = Color.Gray,
                modifier = Modifier.align(Alignment.Center)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                dummyRequests.forEach { request ->
                    item {
                        MaintenanceCard(
                            requestId = request.requestId,
                            category = request.category,
                            status = request.status,
                            dateTime = request.dateTime,
                            navController = navController
                        )
                    }
                }
            }
        }
    }
}





@Composable
fun MaintenanceCard(
    navController: NavController,
    requestId: String,
    category: String,
    status: String,
    dateTime: String
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clickable {
                navController.navigate("MaintenanceRequestDetailsPage/${requestId}")
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
                    text = "Request ID: $requestId",
                    fontSize = 12.sp,
                    color = Color.Gray
                )

                // Status
                Box(
                    modifier = Modifier
                        .background(
                            color = when (status) {
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
                        text = status,
                        fontSize = 12.sp,
                        color = Color.White
                    )
                }
            }

            // Main Section: Category
            Text(
                text = category,
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
                    text = dateTime,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
        }
    }
}
