package com.griffith.ghr

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaintenanceRequestDetailsPage(navController: NavController, requestId: String) {
    val scope = rememberCoroutineScope()

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // Dummy data for maintenance request details
    val roomAllocation = "Room 301"
    val maintenanceCategory = "Electrical"
    val description = "Fixing broken light fixtures."
    val roomAccess = "Yes"
    val completedAt = "2025-01-25 10:30 AM"

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

                        // Request ID
                        Text(
                            text = "Request ID: $requestId",
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                        Spacer(modifier = Modifier.height(16.dp))

                        // Title
                        Text(
                            text = "Maintenance Details",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Spacer(modifier = Modifier.height(32.dp))

                        // Maintenance Details
                        MaintenanceDetailRow(label = "Room Allocation", value = roomAllocation)
                        Spacer(modifier = Modifier.height(16.dp))
                        MaintenanceDetailRow(label = "Maintenance Category", value = maintenanceCategory)
                        Spacer(modifier = Modifier.height(16.dp))
                        MaintenanceDetailRow(label = "Description", value = description)
                        Spacer(modifier = Modifier.height(16.dp))
                        MaintenanceDetailRow(label = "Room Access", value = roomAccess)
                        Spacer(modifier = Modifier.height(16.dp))
                        MaintenanceDetailRow(label = "Completed at", value = completedAt)

                        Spacer(modifier = Modifier.height(32.dp))

                        // Attachments Title
                        Text(
                            text = "Attachments",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Spacer(modifier = Modifier.height(16.dp))

                        // Placeholder for attachments (images can be added here later)
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
                .fillMaxWidth(0.5f) // Ensures alignment across all rows
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
