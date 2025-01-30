package com.griffith.ghr

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

// Retrofit API for Enquiry Requests
interface EnquiryRequestApi {
    @POST("api/auth/enquiries")
    suspend fun createEnquiryRequest(
        @Header("Authorization") token: String,
        @Body request: EnquiryRequestData
    ): EnquiryResponse
}

// Data class for enquiry request payload
data class EnquiryRequestData(
    val requestId: Int,
    val roomNumber: String,
    val enquiryText: String,
)

// Data class for the response
data class EnquiryResponse(
    val message: String,
    val request: EnquiryRequestData
)

@Composable
fun EnquiriesRequestPage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize().background(Color.White)) {
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
                    EnquiriesRequestContent(innerPadding = innerPadding, navController = navController)
                }
            )
        }

        // Notification Drawer Overlay
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
                    .background(Color.White, shape = RoundedCornerShape(topStart = 16.dp, bottomStart = 16.dp))
            ) {
                NotificationDrawerBox()
            }
        }
    }
}

@Composable
fun EnquiriesRequestContent(innerPadding: PaddingValues, navController: NavController) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val userProfileApi = retrofit.create(UserProfileApi::class.java)
    val enquiryRequestApi = retrofit.create(EnquiryRequestApi::class.java)

    // State for user data
    var roomNumber by remember { mutableStateOf<String?>(null) }
    val enquiryText = remember { mutableStateOf("") }
    val isSubmitting = remember { mutableStateOf(false) }
    val showMessage = remember { mutableStateOf<String?>(null) }

    // Fetch user's room number
    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            try {
                val userProfile = userProfileApi.getUserProfile("Bearer $token")
                roomNumber = userProfile.roomNumber
            } catch (e: Exception) {
                println("Error fetching user profile: ${e.message}")
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(innerPadding)
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // Title
            Text(
                text = "Property Enquiry",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Got a question, enquiry or something you want help with? Provide details below.",
                fontSize = 16.sp,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(16.dp))

            HorizontalDivider(color = Color.Gray, thickness = 1.dp)
            Spacer(modifier = Modifier.height(16.dp))

            // Display Room Number
            Text(
                text = "Room Allocation",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            Dropdown(
                label = "Select Room",
                options = listOf("$roomNumber"),
                onOptionSelected = { selectedRoom ->
                    roomNumber = selectedRoom
                }
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Enquiry Details
            Text(
                text = "Your Enquiry",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Spacer(modifier = Modifier.height(8.dp))
            TextBox(
                label = "Enter your enquiry",
                onTextChange = { enquiryText.value = it }
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Submit Button
            Button(
                onClick = {
                    scope.launch {
                        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
                        val token = sharedPreferences.getString("authToken", null)

                        if (token != null && roomNumber != null && enquiryText.value.isNotBlank()) {
                            isSubmitting.value = true
                            try {
                                // Creating requestId (use a unique logic if necessary)
                                val requestId = (System.currentTimeMillis() / 1000).toInt()

                                enquiryRequestApi.createEnquiryRequest(
                                    token = "Bearer $token",
                                    request = EnquiryRequestData(
                                        requestId = requestId,
                                        roomNumber = roomNumber!!,
                                        enquiryText = enquiryText.value
                                    )
                                )
                                showMessage.value = "Enquiry submitted successfully!"
                                navController.navigate("EnquiriesPage") // Refresh or navigate
                            } catch (e: Exception) {
                                showMessage.value = "Failed to submit enquiry. Please try again."
                            } finally {
                                isSubmitting.value = false
                            }
                        }
                    }
                },
                enabled = !isSubmitting.value,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (isSubmitting.value) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Submit Enquiry")
                }
            }

            // Show Message
            showMessage.value?.let { message ->
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = message,
                    fontSize = 16.sp,
                    color = if (message.contains("success")) Color.Green else Color.Red
                )
            }
        }
    }
}
