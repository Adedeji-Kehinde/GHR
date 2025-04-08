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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory


// ------------------------- ENQUIRIES PAGE -------------------------

/**
 * EnquiriesPage - Displays the user's enquiries categorized by status.
 */
@Composable
fun EnquiriesPage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // Drawer States
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    // Tab Navigation State
    val selectedTabIndex = remember { mutableStateOf(0) }
    val tabs = listOf("Pending", "Resolved")

    Box(modifier = Modifier.fillMaxSize()) {
        // Menu Drawer with Main Content
        ModalNavigationDrawer(
            drawerState = menuDrawerState,
            drawerContent = { ModalDrawerSheet { MenuDrawerContent(navController) } },
            modifier = Modifier.fillMaxSize()
        ) {
            Scaffold(
                topBar = {
                    Column {
                        // App Header with Menu & Notifications
                        AppHeader(
                            onMenuClick = { scope.launch { menuDrawerState.open() } },
                            navController = navController,
                            showBackButton = true
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
                        buttonText = "Property Enquiry",
                        navigateTo = "EnquiriesRequestPage"
                    )
                }
            )
        }
    }
}

// ------------------------- ENQUIRIES PAGE CONTENT -------------------------

/**
 * EnquiriesPageContent - Displays enquiries based on the selected tab.
 */
@Composable
fun EnquiriesPageContent(
    navController: NavController,
    innerPadding: PaddingValues,
    selectedTab: Int
) {
    val enquiries = remember { mutableStateListOf<Enquiry>() }
    val context = LocalContext.current
    var userRoomNumber by remember { mutableStateOf<String?>(null) }

    // Fetch user room number and enquiries (same as before)
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val enquiryApi = retrofit.create(EnquiryApi::class.java)
    val userApi = retrofit.create(UserProfileApi::class.java)

    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            try {
                val userProfile = userApi.getUserProfile("Bearer $token")
                userRoomNumber = userProfile.roomNumber

                val allEnquiries = enquiryApi.getEnquiries("Bearer $token")
                enquiries.clear()
                enquiries.addAll(allEnquiries)
            } catch (e: Exception) {
                Log.e("EnquiriesPageContent", "Error fetching data: ${e.message}")
            }
        }
    }

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
            EmptyPageMessage(
                icon = R.drawable.enquiries,
                message = "No enquiries to display"
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                filteredEnquiries.forEach { enquiry ->
                    item { EnquiriesCard(navController, enquiry) }
                }
            }
        }
    }
}


// ------------------------- ENQUIRY CARD -------------------------

/**
 * EnquiriesCard - Displays individual enquiry details in a card format.
 */
@Composable
fun EnquiriesCard(navController: NavController, enquiry: Enquiry) {
    val formattedDateTime = remember(enquiry.createdAt) {
        formatDateTime(enquiry.createdAt)
    }

    // Truncate Enquiry Text to 50 characters max
    val truncatedEnquiryText = if (enquiry.enquiryText.length > 50) {
        "${enquiry.enquiryText.take(30)}..."
    } else {
        enquiry.enquiryText
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .clickable { navController.navigate("EnquiryDetailsPage/${enquiry.requestId}") },
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Request ID: ${enquiry.requestId}", fontSize = 12.sp, color = Color.Gray)
                StatusBadge(status = enquiry.status)
            }

            Text(text = truncatedEnquiryText, fontSize = 18.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 16.dp).padding(bottom = 8.dp))

            Box(
                modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.onBackground).padding(horizontal = 16.dp, vertical = 8.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                Text(text = formattedDateTime, fontSize = 14.sp, color = Color.Gray)
            }
        }
    }
}
