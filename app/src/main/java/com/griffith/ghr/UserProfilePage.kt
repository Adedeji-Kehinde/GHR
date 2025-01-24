package com.griffith.ghr

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserProfilePage(navController: NavController) {
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
                        showBackButton = true // Show back button to navigate back
                    )
                },
                content = { innerPadding ->
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Top,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Profile Image
                        Box(
                            modifier = Modifier
                                .size(120.dp)
                                .background(Color.Gray, shape = CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.app_logo), // Replace with actual profile image
                                contentDescription = "Profile Image",
                                modifier = Modifier
                                    .size(120.dp) // Ensure the image matches the circle size
                                    .clip(CircleShape) // Clip the image into a circle
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // User Name
                        Text(
                            text = "John Doe", // Replace with actual user name
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )

                        Spacer(modifier = Modifier.height(32.dp))

                        // User Details Box with Rounded Corners and Black Outline
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    color = MaterialTheme.colorScheme.surface,
                                    shape = MaterialTheme.shapes.medium
                                )
                                .border(
                                    1.dp,
                                    Color.Black,
                                    shape = MaterialTheme.shapes.medium
                                ) // Black outline
                                .padding(16.dp)
                        ) {
                            Column {
                                UserDetailRow(label = "Gender", detail = "Male")
                                HorizontalDivider(color = Color.Gray, thickness = 0.5.dp)
                                UserDetailRow(label = "Email", detail = "john.doe@example.com")
                                HorizontalDivider(color = Color.Gray, thickness = 0.5.dp)
                                UserDetailRow(label = "Phone", detail = "+1 234 567 8901")
                            }
                        }
                    }
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
                        isNotificationDrawerOpen.value =
                            false // Close drawer when background is clicked
                    }
            )
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .width((2 * LocalConfiguration.current.screenWidthDp / 3).dp) // 2/3 width
                    .align(Alignment.TopEnd)
                    .background(
                        Color.White,
                        shape = RoundedCornerShape(topStart = 16.dp, bottomStart = 16.dp)
                    ) // Apply rounded corners only on the left side
            ) {
                NotificationDrawerBox()
            }
        }
    }
}

@Composable
fun UserDetailRow(label: String, detail: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Label on the left
        Text(
            text = label,
            fontSize = 16.sp,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.weight(1f)
        )

        // Detail on the right
        Text(
            text = detail,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.weight(1f),
            textAlign = androidx.compose.ui.text.style.TextAlign.End
        )
    }
}
