package com.griffith.ghr

import android.graphics.Bitmap
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream

@Composable
fun UsefulInfoPage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    var selectedSection by remember { mutableStateOf<Pair<String, String>?>(null) }

    Box(modifier = Modifier.fillMaxSize()) {
        if (selectedSection != null) {
            PdfViewerScreen(
                sectionTitle = selectedSection!!.first, // Show section name in the top bar
                fileName = selectedSection!!.second,
                onClose = { selectedSection = null }
            )
        } else {
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
                            onMenuClick = { scope.launch { menuDrawerState.open() } },
                            onNotificationClick = { /* Open the notification drawer */ },
                            navController = navController,
                            showBackButton = true,
                        )
                    },
                    content = { innerPadding ->
                        UsefulInfoPageContent(
                            navController = navController,
                            innerPadding = innerPadding,
                            onOpenPdf = { title, file -> selectedSection = title to file }
                        )
                    }
                )
            }
        }
    }
}

@Composable
fun UsefulInfoPageContent(
    navController: NavController,
    innerPadding: PaddingValues,
    onOpenPdf: (String, String) -> Unit
) {
    val sections = listOf(
        "Fire Safety" to "fire_safety.pdf",
        "Post & Parcels" to "post_and_parcel.pdf",
        "Laundry Guide" to "laundry.pdf",
        "Campus Watch" to "campus_watch.pdf",
        "Apartment Sharing" to "sharing_apartments.pdf",
        "Terms & Conditions" to "terms_conditions.pdf"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(innerPadding)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        sections.forEach { (title, fileName) ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOpenPdf(title, fileName) },
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.info),
                        contentDescription = null,
                        tint = Color.Red,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = title,
                        fontWeight = FontWeight.Medium,
                        color = Color.Black,
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfViewerScreen(sectionTitle: String, fileName: String, onClose: () -> Unit) {
    val context = LocalContext.current
    val bitmaps = remember { mutableStateListOf<Bitmap>() }

    LaunchedEffect(fileName) {
        val pdfFile = File(context.cacheDir, fileName)

        // Copy the PDF file from assets to the cache directory
        context.assets.open(fileName).use { inputStream ->
            FileOutputStream(pdfFile).use { outputStream ->
                inputStream.copyTo(outputStream)
            }
        }

        // Use PdfRenderer to render pages
        val fileDescriptor = ParcelFileDescriptor.open(pdfFile, ParcelFileDescriptor.MODE_READ_ONLY)
        val pdfRenderer = PdfRenderer(fileDescriptor)

        for (pageIndex in 0 until pdfRenderer.pageCount) {
            val page = pdfRenderer.openPage(pageIndex)
            val scale = context.resources.displayMetrics.density * 2
            val bitmap = Bitmap.createBitmap(
                (page.width * scale).toInt(),
                (page.height * scale).toInt(),
                Bitmap.Config.ARGB_8888
            )
            page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
            bitmaps.add(bitmap)
            page.close()
        }
        pdfRenderer.close()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(sectionTitle, fontSize = 18.sp) }, // Display section title instead of "PDF Viewer"
                navigationIcon = {
                    IconButton(onClick = onClose) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            bitmaps.forEach { bitmap ->
                Image(
                    bitmap = bitmap.asImageBitmap(),
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(6.dp)
                )
            }
        }
    }
}
