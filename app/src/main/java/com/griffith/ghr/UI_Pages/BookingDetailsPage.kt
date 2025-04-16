package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory


@Composable
fun BookingDetailsPage(navController: NavController, bookingId: String) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // Drawer state as before.
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    // Tab state: 0 = My Booking, 1 = My Payments.
    var selectedTabIndex by remember { mutableStateOf(0) }
    val tabs = listOf("My Booking", "My Payments")

    // States for fetched booking details.
    var bookingDetailsResponse by remember { mutableStateOf<BookingDetailsResponse?>(null) }
    var loading by remember { mutableStateOf(true) }

    // Retrofit API setup.
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val bookingApi = retrofit.create(BookingApi::class.java)

    // Fetch booking details (including payments).
    LaunchedEffect(bookingId) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)
        if (token != null) {
            try {
                val response = bookingApi.getBookingDetails("Bearer $token", bookingId)
                bookingDetailsResponse = response
                if (response.booking == null) {
                    Toast.makeText(context, "Booking not found.", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Log.e("BookingDetailsPage", "Error fetching booking details", e)
                Toast.makeText(context, "Failed to fetch booking details.", Toast.LENGTH_LONG).show()
            }
        } else {
            Toast.makeText(context, "No authentication token. Please log in again.", Toast.LENGTH_LONG).show()
        }
        loading = false
    }

    Box(modifier = Modifier.fillMaxSize()) {
        ModalNavigationDrawer(
            drawerState = menuDrawerState,
            drawerContent = { ModalDrawerSheet { MenuDrawerContent(navController) } },
            modifier = Modifier.fillMaxSize()
        ) {
            Scaffold(
                topBar = {
                    Column {
                        AppHeader(
                            onMenuClick = { scope.launch { menuDrawerState.open() } },
                            navController = navController,
                            showBackButton = true
                        )
                        // TabRow placed right below the header.
                        TabRow(
                            selectedTabIndex = selectedTabIndex,
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White
                        ) {
                            tabs.forEachIndexed { index, title ->
                                Tab(
                                    selected = selectedTabIndex == index,
                                    onClick = { selectedTabIndex = index },
                                    text = { Text(title) }
                                )
                            }
                        }
                    }
                },
                content = { innerPadding ->
                    BookingDetailsTabbedContent(
                        bookingDetailsResponse = bookingDetailsResponse,
                        loading = loading,
                        selectedTab = selectedTabIndex,
                        innerPadding = innerPadding
                    )
                }
            )
        }
    }
}

@Composable
fun BookingDetailsTabbedContent(
    bookingDetailsResponse: BookingDetailsResponse?,
    loading: Boolean,
    selectedTab: Int,
    innerPadding: PaddingValues
) {
    val scrollState = rememberScrollState()
    if (loading) {
        // Display the my_booking icon centered on the screen.
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentAlignment = Alignment.Center
        ) {
            EmptyPageMessage(
                icon = R.drawable.my_booking,
                message = "No bookings to display"
            )
        }
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            when (selectedTab) {
                0 -> {
                    // My Booking Tab: Show booking details as rows with dividers.
                    if (bookingDetailsResponse?.booking == null) {
                        EmptyPageMessage(
                            icon = R.drawable.my_booking,
                            message = "No bookings to display"
                        )
                    } else {
                        BookingDetailRow(label = "Building Block", value = bookingDetailsResponse.booking.buildingBlock)
                        BookingDetailRow(label = "Floor", value = bookingDetailsResponse.booking.floor.toString())
                        BookingDetailRow(label = "Apartment", value = bookingDetailsResponse.booking.apartmentNumber.toString())
                        BookingDetailRow(label = "Bed Space", value = bookingDetailsResponse.booking.bedSpace)
                        BookingDetailRow(label = "Room Type", value = bookingDetailsResponse.booking.roomType)
                        BookingDetailRow(label = "Length of Stay", value = bookingDetailsResponse.booking.lengthOfStay)
                        BookingDetailRow(
                            label = "Check-In",
                            value = bookingDetailsResponse.booking.checkInDate?.let { formatDateTime(it) } ?: "-"
                        )
                        BookingDetailRow(
                            label = "Check-Out",
                            value = bookingDetailsResponse.booking.checkOutDate?.let { formatDateTime(it) } ?: "-"
                        )
                    }
                }
                1 -> {
                    // My Payments Tab: Display payment details.
                    if (bookingDetailsResponse?.payments.isNullOrEmpty()) {
                        EmptyPageMessage(
                            icon = R.drawable.my_booking,
                            message = "No payments to display"
                        )
                    } else {
                        // Optional summary section (if desired, you can remove or adjust it)
                        val payments = bookingDetailsResponse!!.payments
                        val totalAmount = payments.sumOf { it.amount }
                        val totalPaid = payments.filter { it.status == "Paid" }.sumOf { it.amount }
                        val totalUnpaid = payments.filter { it.status == "Unpaid" }.sumOf { it.amount }

                        BookingDetailRow(label = "Total Contract Amount", value = "€${"%.2f".format(totalAmount)}")
                        BookingDetailRow(label = "Total Paid", value = "€${"%.2f".format(totalPaid)}")
                        BookingDetailRow(label = "Total Unpaid", value = "€${"%.2f".format(totalUnpaid)}")

                        Spacer(modifier = Modifier.height(16.dp))

                        // Payment list: Each payment in a card with background color based on status.
                        bookingDetailsResponse.payments.forEach { payment ->
                            val cardColor = if (payment.status.equals("Paid", ignoreCase = true))
                                Color(0xFFD0F0C0) // light green
                            else
                                Color(0xFFFFC0C0) // light red
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                shape = RoundedCornerShape(8.dp),
                                colors = CardDefaults.cardColors(containerColor = cardColor),
                                elevation = CardDefaults.cardElevation(4.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    PaymentDetailRow(label = "Stay Month", value = payment.stayMonth)
                                    PaymentDetailRow(label = "Stay Dates", value = payment.stayDates)
                                    PaymentDetailRow(label = "Amount", value = "€${payment.amount}")
                                    PaymentDetailRow(label = "Due Date", value = formatDateTime(payment.dueDate))
                                    PaymentDetailRow(label = "Status", value = payment.status)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BookingDetailRow(label: String, value: String?) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.padding(vertical = 4.dp)) {
            Text(
                text = "$label:",
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )
            Text(text = value ?: "-", modifier = Modifier.weight(1f))
        }
        Divider(color = Color.LightGray, thickness = 0.5.dp)
    }
}

@Composable
fun PaymentDetailRow(label: String, value: String?) {
    // Reuse the same style as booking detail rows.
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.padding(vertical = 4.dp)) {
            Text(
                text = "$label:",
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )
            Text(text = value ?: "-", modifier = Modifier.weight(1f))
        }
        Divider(color = Color.LightGray, thickness = 0.5.dp)
    }
}
