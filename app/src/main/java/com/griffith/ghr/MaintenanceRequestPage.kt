package com.griffith.ghr

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import kotlinx.coroutines.launch

@Composable
fun MaintenanceRequestPage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    // State for notification drawer
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize().background(Color.White)) { // Ensure white background
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
                        showBackButton = true  // Show back button for navigation
                    )
                },
                content = { innerPadding ->
                    MaintenanceRequestContent(innerPadding = innerPadding)
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
fun MaintenanceRequestContent(innerPadding: PaddingValues) {
    val selectedImages = remember { mutableStateListOf<Uri>() } // Mutable list for selected images
    val isImageExpanded = remember { mutableStateOf<Uri?>(null) } // Tracks the expanded image
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri != null && selectedImages.size < 3) {
            selectedImages.add(uri) // Add the new image if below the limit
        }
    }
    val screenWidth = LocalConfiguration.current.screenWidthDp.dp
    val imageSize = (screenWidth - 24.dp) / 2 // Adjust size to fit two images per row with spacing

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(innerPadding)
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()) // Enable scrolling
        ) {
            // Title
            Text(
                text = "Maintenance Request",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))

            // Placeholder subtitle
            Text(
                text = "Our team is available during office hours. For weekend emergencies, please reach out to our hotline. Thank you for your understanding.",
                fontSize = 16.sp,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Horizontal divider
            HorizontalDivider(color = Color.Gray, thickness = 1.dp)
            Spacer(modifier = Modifier.height(16.dp))

            // Room Allocation
            Text(
                text = "Room Allocation",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            Dropdown(
                label = "Select Room",
                options = listOf("Room 101", "Room 102", "Room 103"), // Placeholder options
                onOptionSelected = { selectedOption ->
                    println("Selected Room: $selectedOption")
                }
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Maintenance Category
            Text(
                text = "Maintenance Category",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            Dropdown(
                label = "Select Category",
                options = listOf("Plumbing", "Electrical", "Carpentry"), // Placeholder options
                onOptionSelected = { selectedOption ->
                    println("Selected Category: $selectedOption")
                }
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Description
            Text(
                text = "Description",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            TextBox(
                label = "Enter a brief description of the issue",
                onTextChange = { userInput ->
                    println("User Description: $userInput")
                }
            )
            Spacer(modifier = Modifier.height(16.dp))

            // May we enter your room when you're away?
            Text(
                text = "May we enter your room when you're away?",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            Dropdown(
                label = "Select Option",
                options = listOf("Yes", "No"), // Placeholder options
                onOptionSelected = { selectedOption ->
                    println("Selected Option: $selectedOption")
                }
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Pictures Section
            Text(
                text = "Pictures",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "up to 3 pictures, max file size is 10MB",
                fontSize = 14.sp,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Display Images with Upload Icon
            for (rowIndex in 0..(selectedImages.size / 2)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp) // Spacing between images
                ) {
                    val firstIndex = rowIndex * 2
                    if (firstIndex < selectedImages.size) {
                        ImageBox(
                            uri = selectedImages[firstIndex],
                            size = imageSize,
                            onRemove = { selectedImages.removeAt(firstIndex) },
                            onExpand = { isImageExpanded.value = selectedImages[firstIndex] }
                        )
                    }

                    val secondIndex = firstIndex + 1
                    if (secondIndex < selectedImages.size) {
                        ImageBox(
                            uri = selectedImages[secondIndex],
                            size = imageSize,
                            onRemove = { selectedImages.removeAt(secondIndex) },
                            onExpand = { isImageExpanded.value = selectedImages[secondIndex] }
                        )
                    } else if (selectedImages.size < 3) {
                        // Upload Image Icon Box
                        UploadImageBox(
                            size = imageSize,
                            onClick = { launcher.launch("image/*") }
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp)) // Vertical spacing between rows
            }

            // Full-Screen Image View
            isImageExpanded.value?.let { expandedUri ->
                Dialog(onDismissRequest = { isImageExpanded.value = null }) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.Black)
                    ) {
                        Image(
                            painter = rememberAsyncImagePainter(expandedUri),
                            contentDescription = null,
                            contentScale = ContentScale.Fit,
                            modifier = Modifier
                                .fillMaxSize()
                                .clickable { isImageExpanded.value = null }
                        )
                    }
                }
            }
        }
    }
}