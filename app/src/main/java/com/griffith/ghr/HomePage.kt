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

@Composable
fun HomePage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    // State for notification drawer
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

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
                        showBackButton = false
                    )
                },
                content = { innerPadding ->
                    HomePageContent(
                        navController = navController,
                        innerPadding = innerPadding
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
@Composable
fun HomePageContent(navController: NavController, innerPadding: PaddingValues) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Red)
            .padding(innerPadding) // Apply inner padding
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // First large card with custom text and clickable navigation
            LargeCard(
                title = "My Deliveries",
                subtitle = "",
                onClick = {
                    navController.navigate("deliveriesPage")
                }
            )

            // Row with two smaller cards side by side
            Row(
                modifier = Modifier
                    .fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp) // Spacing between cards
            ) {
                SmallCard(
                    title = "Maintenance",
                    subtitle = "Have an issue?",
                    onClick = {
                        navController.navigate("maintenancePage")
                    },
                    modifier = Modifier.weight(1f) // Equal width for both cards
                )
                SmallCard(
                    title = "Enquiries",
                    subtitle = "Ask us anything",
                    onClick = {
                        navController.navigate("enquiriesPage")
                    },
                    modifier = Modifier.weight(1f) // Equal width for both cards
                )
            }

            // Second large card with custom text and clickable navigation
            LargeCard(
                title = "Useful Information",
                subtitle = "Find out more information",
                onClick = {
                    navController.navigate("usefulInfoPage")
                }
            )
        }
    }
}

