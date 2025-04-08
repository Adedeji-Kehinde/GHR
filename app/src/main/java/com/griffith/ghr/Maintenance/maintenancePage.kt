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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory


// ------------------------- MAINTENANCE PAGE -------------------------

/**
 * MaintenancePage - Displays the user's maintenance requests categorized by status.
 */
@Composable
fun MaintenancePage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // Drawer States
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    // Tab Navigation State
    val selectedTabIndex = remember { mutableStateOf(0) }
    val tabs = listOf("In Progress", "Completed")

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
    }
}

// ------------------------- MAINTENANCE PAGE CONTENT -------------------------

/**
 * MaintenancePageContent - Displays maintenance requests based on the selected tab.
 */
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
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val maintenanceApi = retrofit.create(MaintenanceApi::class.java)
    val userApi = retrofit.create(UserProfileApi::class.java)

    // Fetch user room number and maintenance requests
    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            try {
                val userProfile = userApi.getUserProfile("Bearer $token")
                userRoomNumber = userProfile.roomNumber

                val allRequests = maintenanceApi.getMaintenanceRequests("Bearer $token")
                maintenanceRequests.clear()
                maintenanceRequests.addAll(allRequests)
            } catch (e: Exception) {
                Log.e("MaintenancePageContent", "Error fetching data: ${e.message}")
            }
        }
    }

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
            EmptyPageMessage(
                icon = R.drawable.maintenance,
                message = "No maintenance requests to display"
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                filteredRequests.forEach { request ->
                    item { MaintenanceCard(navController, request) }
                }
            }
        }
    }
}

// ------------------------- MAINTENANCE CARD -------------------------

/**
 * MaintenanceCard - Displays individual maintenance request details in a card format.
 */
@Composable
fun MaintenanceCard(navController: NavController, request: MaintenanceRequest) {
    val formattedDateTime = remember(request.createdAt) {
        formatDateTime(request.createdAt)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clickable { navController.navigate("MaintenanceRequestDetailsPage/${request.requestId}") },
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            // Request ID and Status
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Request ID: ${request.requestId}", fontSize = 12.sp, color = Color.Gray)
                StatusBadge(status = request.status)
            }

            // Maintenance Category
            Text(text = request.category, fontSize = 18.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 16.dp).padding(bottom = 8.dp))

            // Date and Time
            Box(
                modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.onBackground).padding(horizontal = 16.dp, vertical = 8.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                Text(text = formattedDateTime, fontSize = 14.sp, color = Color.Gray)
            }
        }
    }
}

