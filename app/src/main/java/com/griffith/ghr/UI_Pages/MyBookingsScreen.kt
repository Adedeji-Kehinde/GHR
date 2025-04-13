package com.griffith.ghr

import android.content.Context
import android.util.Log
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// ------------------------- MY BOOKINGS SCREEN -------------------------

@Composable
fun MyBookingsScreen(navController: NavController) {
    val scope = rememberCoroutineScope()

    // Drawer States
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    // Tab Navigation State - three tabs: Active, Expired, Cancelled
    val selectedTabIndex = remember { mutableStateOf(0) }
    val tabs = listOf("Active", "Expired", "Cancelled")

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
                        // App Header with Menu & Notifications; pass a title "My Bookings"
                        AppHeader(
                            onMenuClick = { scope.launch { menuDrawerState.open() } },
                            navController = navController,
                            showBackButton = true,
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
                    MyBookingsContent(
                        navController = navController,
                        innerPadding = innerPadding,
                        selectedTab = selectedTabIndex.value
                    )
                }
            )
        }
    }
}

// ------------------------- MY BOOKINGS CONTENT -------------------------

@Composable
fun MyBookingsContent(
    navController: NavController,
    innerPadding: PaddingValues,
    selectedTab: Int
) {
    val context = LocalContext.current
    // List to hold bookings fetched from the backend.
    val bookings = remember { mutableStateListOf<Booking>() }
    // State for the user profile.
    var userProfile by remember { mutableStateOf<UserProfile?>(null) }

    // Retrofit API setup (use your base URL)
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val bookingApi = retrofit.create(BookingApi::class.java)
    val userApi = retrofit.create(UserProfileApi::class.java)

    // Fetch user profile and bookings
    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)
        if (token != null) {
            try {
                // Fetch the current user profile.
                val fetchedUserProfile = userApi.getUserProfile("Bearer $token")
                userProfile = fetchedUserProfile
                // Fetch all bookings.
                val allBookings = bookingApi.getBookings("Bearer $token")
                // Filter bookings so that only those belonging to the current user are kept.
                val userBookings = fetchedUserProfile?.let { profile ->
                    allBookings.filter { booking ->
                        booking.userReference.id == profile.id
                    }
                } ?: emptyList()
                bookings.clear()
                bookings.addAll(userBookings)
            } catch (e: Exception) {
                Log.e("MyBookingsContent", "Error fetching bookings: ${e.message}")
            }
        }
    }

    // Filter bookings based on the selected tab.
    val filteredBookings = bookings.filter { booking ->
        when (selectedTab) {
            0 -> booking.status == "Booked"   // Active
            1 -> booking.status == "Expired"  // Expired
            2 -> booking.status == "Cancelled"// Cancelled
            else -> false
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(innerPadding)
    ) {
        if (filteredBookings.isEmpty()) {
            EmptyPageMessage(
                icon = R.drawable.my_booking, // Use your icon for no bookings.
                message = "No bookings to display"
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                filteredBookings.forEach { booking ->
                    item { BookingCard(booking) }
                }
            }
        }
    }
}

// ------------------------- BOOKING CARD -------------------------

/**
 * BookingCard - A simple card displaying basic booking details.
 */
@Composable
fun BookingCard(booking: Booking) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column {
            // Building Image (non-clickable)
            Box(modifier = Modifier.height(180.dp)) {
                Image(
                    painter = painterResource(id = R.drawable.building), // Ensure drawable exists in res/drawable
                    contentDescription = "Building Image",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                // Optional status badge for Expired/Cancelled bookings
                if (booking.status == "Expired" || booking.status == "Cancelled") {
                    Text(
                        text = "Past",
                        color = Color.White,
                        modifier = Modifier
                            .padding(8.dp)
                            .background(
                                color = Color(0x80000000), // semi-transparent black
                                shape = RoundedCornerShape(4.dp)
                            )
                            .padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
            // Details Section
            Column(modifier = Modifier.padding(16.dp)) {
                // First line: e.g. "Bed 1.1A, Block 1A, Ensuite"
                Text(
                    text = "Bed ${booking.floor}.${booking.apartmentNumber}${booking.bedSpace}, Block ${booking.buildingBlock}, ${booking.roomType}",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 16.sp,
                    color = Color.Black
                )
                Spacer(modifier = Modifier.height(4.dp))
                // Second line: Formatted Check-In and Check-Out dates
                val checkIn = booking.checkInDate?.let { formatDateTime(it) } ?: "-"
                val checkOut = booking.checkOutDate?.let { formatDateTime(it) } ?: "-"
                Text(
                    text = "$checkIn  →  $checkOut",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Spacer(modifier = Modifier.height(4.dp))
                // Third line: Length of Stay
                Text(
                    text = booking.lengthOfStay,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
        }
    }
}
