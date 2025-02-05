package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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

// ------------------------- ENQUIRY DETAILS PAGE -------------------------

/**
 * EnquiryDetailsPage - Displays detailed information about a specific enquiry.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EnquiryDetailsPage(navController: NavController, requestId: String) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // Drawer states
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // Enquiry details state
    var enquiryDetails by remember { mutableStateOf<Enquiry?>(null) }

    // Retrofit setup
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val enquiryApi = retrofit.create(EnquiryApi::class.java)

    // Fetch enquiry details
    LaunchedEffect(requestId) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            scope.launch {
                try {
                    val enquiries = enquiryApi.getEnquiries("Bearer $token")
                    enquiryDetails = enquiries.find { it.requestId == requestId }

                    if (enquiryDetails == null) {
                        Toast.makeText(context, "Enquiry not found.", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    Log.e("EnquiryDetailsPage", "Error fetching enquiries", e)
                    Toast.makeText(context, "Failed to fetch enquiry details.", Toast.LENGTH_LONG).show()
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
                    EnquiryDetailsContent(
                        requestId = requestId,
                        enquiryDetails = enquiryDetails,
                        innerPadding = innerPadding
                    )
                }
            )
        }

        if (isNotificationDrawerOpen.value) {
            NotificationDrawerOverlay(isNotificationDrawerOpen)
        }
    }
}

// ------------------------- ENQUIRY DETAILS CONTENT -------------------------

/**
 * EnquiryDetailsContent - Displays the content inside the Enquiry Details Page.
 */
@Composable
fun EnquiryDetailsContent(requestId: String, enquiryDetails: Enquiry?, innerPadding: PaddingValues) {
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
            Text(text = "Request ID: $requestId", fontSize = 14.sp, color = Color.Gray)
            Box(
                modifier = Modifier
                    .background(
                        color = when (enquiryDetails?.status) {
                            "Pending" -> Color.Blue
                            "Resolved" -> Color.Green
                            else -> Color.Gray
                        },
                        shape = RoundedCornerShape(16.dp)
                    )
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Text(
                    text = enquiryDetails?.status ?: "-",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Enquiry Details
        EnquiryDetailRow(label = "Room Number", value = enquiryDetails?.roomNumber)
        EnquiryDetailRow(label = "Enquiry Text", value = enquiryDetails?.enquiryText)
        EnquiryDetailRow(label = "Created At", value = enquiryDetails?.createdAt?.let { formatDateTime(it) })
        EnquiryDetailRow(label = "Resolved At", value = enquiryDetails?.resolvedAt?.let { formatDateTime(it) })
    }
}

// ------------------------- HELPER COMPOSABLES -------------------------

/**
 * EnquiryDetailRow - A reusable row for displaying a label and its corresponding value.
 */
@Composable
fun EnquiryDetailRow(label: String, value: String?) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, fontSize = 16.sp, fontWeight = FontWeight.Medium, color = Color.Gray, modifier = Modifier.weight(1f))
        Box(modifier = Modifier.fillMaxWidth(0.5f)) {
            Text(text = value ?: "-", fontSize = 16.sp, fontWeight = FontWeight.Normal, color = Color.Black)
        }
    }
}


