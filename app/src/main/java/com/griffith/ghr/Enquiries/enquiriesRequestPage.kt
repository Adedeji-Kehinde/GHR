package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
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


// ------------------------- ENQUIRY REQUEST PAGE -------------------------

@Composable
fun EnquiriesRequestPage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // Drawer States
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize().background(Color.White)) {
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
                    EnquiriesRequestContent(innerPadding, navController)
                }
            )
        }
    }
}

// ------------------------- ENQUIRY REQUEST CONTENT -------------------------

@Composable
fun EnquiriesRequestContent(innerPadding: PaddingValues, navController: NavController) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // Retrofit setup
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val userProfileApi = retrofit.create(UserProfileApi::class.java)
    val enquiryRequestApi = retrofit.create(EnquiryRequestApi::class.java)

    // State Variables
    var roomNumber by remember { mutableStateOf<String?>(null) }
    val enquiryText = remember { mutableStateOf("") }
    val isSubmitting = remember { mutableStateOf(false) }

    // Fetch user's room number
    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            try {
                val userProfile = userProfileApi.getUserProfile("Bearer $token")
                roomNumber = userProfile.roomNumber
            } catch (e: Exception) {
                Log.e("UserProfile", "Error fetching user profile", e)
                Toast.makeText(context, "Failed to load profile. Please try again.", Toast.LENGTH_LONG).show()
            }
        }
    }

    Box(
        modifier = Modifier.fillMaxSize().padding(innerPadding).padding(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())
        ) {
            // Title
            Text(text = "Property Enquiry", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Got a question, enquiry, or something you want help with? Provide details below.",
                fontSize = 14.sp,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(16.dp))

            HorizontalDivider(color = Color.Gray, thickness = 1.dp)
            Spacer(modifier = Modifier.height(16.dp))

            // Room Number Dropdown
            Text(text = "Room Allocation", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Spacer(modifier = Modifier.height(8.dp))

            Dropdown(
                label = "Select Room",
                options = listOf("$roomNumber"),
                onOptionSelected = { selectedRoom -> roomNumber = selectedRoom }
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Enquiry Details
            Text(text = "Your Enquiry", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
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
                                val requestId = (System.currentTimeMillis() / 1000).toInt()

                                enquiryRequestApi.createEnquiryRequest(
                                    token = "Bearer $token",
                                    request = EnquiryRequestData(
                                        requestId = requestId,
                                        roomNumber = roomNumber!!,
                                        enquiryText = enquiryText.value
                                    )
                                )
                                // Show Success Toast
                                Toast.makeText(context, "Enquiry submitted successfully!", Toast.LENGTH_LONG).show()
                                navController.navigate("EnquiriesPage")
                            } catch (e: Exception) {
                                Log.e("EnquiryRequest", "Error submitting enquiry", e)
                                Toast.makeText(context, "Failed to submit enquiry. Please try again.", Toast.LENGTH_LONG).show()
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
        }
    }
}
