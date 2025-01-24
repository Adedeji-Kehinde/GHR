package com.griffith.ghr

import android.graphics.Bitmap
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream

@Composable
fun UsefulInfoPage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

    var pdfFileName by remember { mutableStateOf<String?>(null) }

    Box(modifier = Modifier.fillMaxSize()) {
        if (pdfFileName != null) {
            PdfViewerScreen(
                fileName = pdfFileName!!,
                onClose = { pdfFileName = null } // Clear file name to close viewer
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
                            onMenuClick = {
                                scope.launch {
                                    menuDrawerState.open() // Open the menu drawer
                                }
                            },
                            onNotificationClick = {
                                // Open the notification drawer
                            },
                            navController = navController,
                            showBackButton = true,  // Show back button for navigation
                        )
                    },
                    content = { innerPadding ->
                        UsefulInfoPageContent(
                            navController = navController,
                            innerPadding = innerPadding,
                            onOpenPdf = { pdfFileName = it }
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
    onOpenPdf: (String) -> Unit
) {
    val sections = listOf(
        "Fire Safety" to "fire_safety.pdf",
        "Post and Parcel" to "post_and_parcel.pdf",
        "Laundry Use" to "laundry.pdf"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(innerPadding)
            .padding(16.dp),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.Start
    ) {
        sections.forEach { (title, fileName) ->
            Text(
                text = title,
                style = MaterialTheme.typography.headlineSmall,
                color = Color.Black,
                modifier = Modifier.clickable { onOpenPdf(fileName) }
            )
            Spacer(modifier = Modifier.height(16.dp))
            Divider(thickness = 1.dp, color = Color.Gray)
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PdfViewerScreen(fileName: String, onClose: () -> Unit) {
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
            // Scale the bitmap to fit the screen width
            val scale = context.resources.displayMetrics.density * 2 // Adjust scale factor as needed
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
                title = { Text("PDF Viewer") },
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
                .verticalScroll(rememberScrollState())
                .padding(innerPadding)
        ) {
            bitmaps.forEach { bitmap ->
                Image(
                    bitmap = bitmap.asImageBitmap(),
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp)
                )
            }
        }
    }
}
