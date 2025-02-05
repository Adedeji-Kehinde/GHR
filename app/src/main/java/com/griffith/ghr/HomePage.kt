package com.griffith.ghr

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import kotlinx.coroutines.launch

// ------------------------- Home Page -------------------------

/**
 * HomePage - The main screen containing navigation drawers, header, and home content.
 */
@Composable
fun HomePage(navController: NavController) {
    val scope = rememberCoroutineScope()
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)// State for menu drawer
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }// State for notification drawer

    Box(modifier = Modifier.fillMaxSize()) {
        // Menu Drawer with Main Content
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
                            scope.launch { menuDrawerState.open() } // Open menu drawer
                        },
                        onNotificationClick = {
                            isNotificationDrawerOpen.value = true // Open notification drawer
                        },
                        navController = navController,
                        showBackButton = false
                    )
                },
                content = { innerPadding ->
                    HomePageContent(navController = navController, innerPadding = innerPadding)
                }
            )
        }

        // Notification Drawer Overlay
        if (isNotificationDrawerOpen.value) {
            NotificationDrawerOverlay(
                isNotificationDrawerOpen = isNotificationDrawerOpen
            )
        }
    }
}

// ------------------------- Home Page Content -------------------------

/**
 * HomePageContent - Displays the main content inside the Home Page.
 */
@Composable
fun HomePageContent(navController: NavController, innerPadding: PaddingValues) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Red)
            .padding(innerPadding) // Apply inner padding from Scaffold
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Large card for "My Deliveries"
            LargeCard(
                title = "My Deliveries",
                subtitle = "",
                icon = painterResource(id = R.drawable.deliveries),
                onClick = { navController.navigate("deliveriesPage") }
            )

            // Row with two smaller cards side by side
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                SmallCard(
                    title = "Maintenance",
                    subtitle = "Have an issue?",
                    icon = painterResource(id = R.drawable.maintenance),
                    onClick = { navController.navigate("maintenancePage") },
                    modifier = Modifier.weight(1f) // Equal width for both cards
                )
                SmallCard(
                    title = "Enquiries",
                    subtitle = "Ask us anything",
                    icon = painterResource(id = R.drawable.enquiries),
                    onClick = { navController.navigate("enquiriesPage") },
                    modifier = Modifier.weight(1f) // Equal width for both cards
                )
            }

            // Large card for "Useful Information"
            LargeCard(
                title = "Useful Information",
                subtitle = "Find out more information",
                icon = painterResource(id = R.drawable.info),
                onClick = { navController.navigate("usefulInfoPage") }
            )
        }
    }
}

