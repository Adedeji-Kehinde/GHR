package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// ------------------------- MAINTENANCE REQUEST DETAILS PAGE -------------------------

/**
 * MaintenanceRequestDetailsPage - Displays detailed information about a specific maintenance request.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaintenanceRequestDetailsPage(navController: NavController, requestId: String) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // Drawer states
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // Maintenance request details state
    var maintenanceDetails by remember { mutableStateOf<MaintenanceRequest?>(null) }
    var selectedImage by remember { mutableStateOf<String?>(null) } // Selected image for full-screen preview

    // Retrofit setup
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val maintenanceApi = retrofit.create(MaintenanceApi::class.java)

    // Fetch maintenance request details
    LaunchedEffect(requestId) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            scope.launch {
                try {
                    val maintenanceRequests = maintenanceApi.getMaintenanceRequests("Bearer $token")
                    maintenanceDetails = maintenanceRequests.find { it.requestId == requestId }

                    if (maintenanceDetails == null) {
                        Toast.makeText(context, "Maintenance request not found.", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    Log.e("MaintenanceDetailsPage", "Error fetching maintenance requests", e)
                    Toast.makeText(context, "Failed to fetch maintenance details.", Toast.LENGTH_LONG).show()
                }
            }
        } else {
            Toast.makeText(context, "No authentication token found. Please log in again.", Toast.LENGTH_LONG).show()
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        ModalNavigationDrawer(
            drawerState = menuDrawerState,
            drawerContent = { ModalDrawerSheet { MenuDrawerContent(navController) } },
            modifier = Modifier.fillMaxSize()
        ) {
            Scaffold(
                topBar = {
                    AppHeader(
                        onMenuClick = { scope.launch { menuDrawerState.open() } },
                        onNotificationClick = { isNotificationDrawerOpen.value = true },
                        navController = navController,
                        showBackButton = true
                    )
                },
                content = { innerPadding ->
                    MaintenanceDetailsContent(
                        maintenanceDetails = maintenanceDetails,
                        innerPadding = innerPadding,
                        selectedImage = selectedImage,
                        onImageClick = { selectedImage = it },
                        onCloseImage = { selectedImage = null }
                    )
                }
            )
        }

        if (isNotificationDrawerOpen.value) {
            NotificationDrawerOverlay(isNotificationDrawerOpen)
        }
    }
}

// ------------------------- MAINTENANCE DETAILS CONTENT -------------------------

/**
 * MaintenanceDetailsContent - Displays the content inside the Maintenance Request Details Page.
 */
@Composable
fun MaintenanceDetailsContent(
    maintenanceDetails: MaintenanceRequest?,
    innerPadding: PaddingValues,
    selectedImage: String?,
    onImageClick: (String) -> Unit,
    onCloseImage: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(innerPadding)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()), // ✅ Scrollable page
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
            Text(text = "Request ID: ${maintenanceDetails?.requestId ?: "-"}", fontSize = 14.sp, color = Color.Gray)
            StatusBadge(status = maintenanceDetails?.status)
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Maintenance Details
        MaintenanceDetailRow(label = "Room Number", value = maintenanceDetails?.roomNumber)
        MaintenanceDetailRow(label = "Category", value = maintenanceDetails?.category)
        MaintenanceDetailRow(label = "Description", value = maintenanceDetails?.description)
        MaintenanceDetailRow(label = "Room Access", value = maintenanceDetails?.roomAccess)
        MaintenanceDetailRow(label = "Completed At", value = maintenanceDetails?.completedAt?.let { formatDateTime(it) })

        Spacer(modifier = Modifier.height(32.dp))

        // Attachments
        Text(text = "Attachments", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
        Spacer(modifier = Modifier.height(16.dp))

        if (maintenanceDetails?.pictures.isNullOrEmpty()) {
            EmptyPageMessage(icon = R.drawable.maintenance, message = "No Attachments Available")
        } else {
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                maintenanceDetails.pictures.forEach { imageUrl ->
                    item {
                        Image(
                            painter = rememberAsyncImagePainter(imageUrl),
                            contentDescription = "Maintenance Image",
                            modifier = Modifier
                                .size(120.dp)
                                .background(Color.Gray, shape = RoundedCornerShape(8.dp))
                                .padding(4.dp)
                                .clickable { onImageClick(imageUrl) }, // ✅ Clicking image opens full screen
                            contentScale = ContentScale.Crop
                        )
                    }
                }
            }
        }
    }

    // Full-Screen Image Viewer
    selectedImage?.let { imageUrl ->
        Dialog(onDismissRequest = { onCloseImage() }) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black)
                    .clickable { onCloseImage() }, // Click anywhere to close
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = rememberAsyncImagePainter(imageUrl),
                    contentDescription = "Full-Screen Image",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Fit
                )
            }
        }
    }
}

// ------------------------- HELPER COMPOSABLE -------------------------

@Composable
fun MaintenanceDetailRow(label: String, value: String?) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, fontSize = 16.sp, fontWeight = FontWeight.Medium, color = Color.Gray, modifier = Modifier.weight(1f)
        )
        Box(modifier = Modifier.fillMaxWidth(0.5f)) {
            Text(text = value?: "-", fontSize = 16.sp, fontWeight = FontWeight.Normal, color = Color.Black)
        }
    }
}
