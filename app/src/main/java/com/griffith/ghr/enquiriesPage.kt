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

interface EnquiryApi {
    @GET("api/auth/enquiries")
    suspend fun getEnquiries(@Header("Authorization") token: String): List<Enquiry>
}
data class Enquiry(
    val requestId: String,
    val roomNumber: String,
    val enquiryText: String,
    val status: String,
    val createdAt: String,
    val resolvedAt: String
)

@Composable
fun EnquiriesPage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    // State for notification drawer
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // State for the selected tab
    val selectedTabIndex = remember { mutableStateOf(0) }
    val tabs = listOf("Pending", "Resolved")

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
                    EnquiriesPageContent(
                        navController = navController,
                        innerPadding = innerPadding,
                        selectedTab = selectedTabIndex.value
                    )
                },
                bottomBar = {
                    FooterButton(
                        navController = navController,
                        buttonText = "Property Enquiry", // Button text
                        navigateTo = "EnquiriesRequestPage" // Destination page
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
fun EnquiriesPageContent(
    navController: NavController,
    innerPadding: PaddingValues,
    selectedTab: Int
) {
    val enquiries = remember { mutableStateListOf<Enquiry>() }
    val context = LocalContext.current
    var userRoomNumber by remember { mutableStateOf<String?>(null) }

    // Retrofit setup
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com") // Replace with your backend URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val enquiryApi = retrofit.create(EnquiryApi::class.java)
    val userApi = retrofit.create(UserProfileApi::class.java)

    // Fetch user's room number and enquiries
    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            try {
                // Fetch user profile to get room number
                val userProfile = userApi.getUserProfile("Bearer $token")
                userRoomNumber = userProfile.roomNumber

                // Fetch all enquiries
                val allEnquiries = enquiryApi.getEnquiries("Bearer $token")
                enquiries.clear()
                enquiries.addAll(allEnquiries) // Add all enquiries to the list
            } catch (e: Exception) {
                Log.e("EnquiriesPageContent", "Error fetching data: ${e.message}")
            }
        }
    }

    // Filter enquiries based on room number and selected tab
    val filteredEnquiries = enquiries.filter { enquiry ->
        enquiry.roomNumber == userRoomNumber && when (selectedTab) {
            0 -> enquiry.status == "Pending"
            1 -> enquiry.status == "Resolved"
            else -> false
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(innerPadding)
    ) {
        if (filteredEnquiries.isEmpty()) {
            Text(
                text = "No enquiries to display",
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
                filteredEnquiries.forEach { enquiry ->
                    item {
                        EnquiriesCard(
                            navController = navController,
                            enquiry = enquiry
                        )
                    }
                }
            }
        }
    }
}


@Composable
fun EnquiriesCard(navController: NavController, enquiry: Enquiry) {
    // Format the date and time
    val formattedDateTime = remember(enquiry.createdAt) {
        try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault()) // Assuming ISO format
            val outputFormat = SimpleDateFormat("EEE, dd MMM yyyy, HH:mm", Locale.getDefault()) // Date with time
            val date = inputFormat.parse(enquiry.createdAt)
            outputFormat.format(date ?: enquiry.createdAt)
        } catch (e: Exception) {
            enquiry.createdAt // Fallback to original if parsing fails
        }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clickable {
                navController.navigate("EnquiryDetailsPage/${enquiry.requestId}")
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
                    text = "Request ID: ${enquiry.requestId}",
                    fontSize = 12.sp,
                    color = Color.Gray
                )

                // Status
                Box(
                    modifier = Modifier
                        .background(
                            color = when (enquiry.status) {
                                "Pending" -> Color(0xFFFFC107) // Amber
                                "Resolved" -> Color(0xFF4CAF50) // Green
                                else -> Color(0xFFF44336) // Red
                            },
                            shape = RoundedCornerShape(12.dp)
                        )
                        .padding(horizontal = 12.dp, vertical = 4.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = enquiry.status,
                        fontSize = 12.sp,
                        color = Color.White
                    )
                }
            }

            // Main Section: Enquiry Text
            Text(
                text = enquiry.enquiryText,
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

