// Import Necessary modules
const fs = require('fs');
const path = require('path');

// Function to find the path of the SD card
function findSDCardPath() {
    const rootPath = '/Volumes'; // Add the root paths where SD cards might be mounted

    try {
        const directories = fs.readdirSync(rootPath);
        for (const directory of directories) {
            if (directory.includes('JPEGPHOTOS') || directory.includes('RAWPHOTOS')) {
                return path.join(rootPath, directory);
            }
        }
    } catch (err) {
        // Handle directory access errors gracefully (e.g., directory does not exist)
        console.error(`Error accessing directory "${rootPath}": ${err.message}`);
    }

    return null; // Return null if SD card is not found.
}

// Function to find the path to the external hard drive
function findExternalHardDrivePath(driveName) {
    const rootPath = '/Volumes'; // Add the root paths where the external drives might be mounted.

    try {
        const directories = fs.readdirSync(rootPath);
        for (const directory of directories) {
            if (directory === driveName) {
                return path.join(rootPath, directory);
            }
        }
    } catch (err) {
        // Handle directory access errors gracefully (e.g., directory does not exist)
        console.error(`Error accessing directory "${rootPath}": ${err.message}`);
    }

    return null; // Return null if the external hard drive is not found.
}

// Function to ensure a directory exists
function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

// Function to organize the photos
function organizePhotos(sdCardPath, externalHardDrivePath) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

    // Determine the folder name based on the SD card's name
    const sdCardName = path.basename(sdCardPath);

    // Create a folder based on the current date and the SD card's name
    const dateFolder = path.join(externalHardDrivePath, formattedDate, sdCardName);
    ensureDirectoryExists(dateFolder);

    // Define the path to the "102_FUJI" folder where .JPG and .RAF files are located
    const photoFolderPath = path.join(sdCardPath, 'DCIM', '102_FUJI');

    // Organize .JPG and .RAF files
    organizeFiles(photoFolderPath, dateFolder);
}

// Helper function to organize files within a source folder into a destination folder
function organizeFiles(sourceFolder, destinationFolder) {
    // Get a list of files in the source folder
    const files = fs.readdirSync(sourceFolder);

    for (const file of files) {
        const filePath = path.join(sourceFolder, file);

        // Check if the file is a photo (e.g., .JPG or .RAF)
        if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.raf') || file.toLowerCase().endsWith('.mov') ) {
            // Move the file to the appropriate folder
            const destinationPath = path.join(destinationFolder, file);
            ensureDirectoryExists(destinationFolder); // Ensure the destination folder exists

            // Copy the file to the destination and then delete it from the source
            fs.copyFileSync(filePath, destinationPath);
            fs.unlinkSync(filePath);

            console.log(`Organized ${file} to ${destinationPath}`);
        }
    }
}


// Define the source and destination paths
const sdCardPath = findSDCardPath();
const externalHardDriveName = 'PHOTODRIVE';
const externalHardDrivePath = findExternalHardDrivePath(externalHardDriveName);

if (!sdCardPath) {
    console.error('SD card not found.');
    process.exit(1);
}

if (!externalHardDrivePath) {
    console.error(`External hard drive "${externalHardDriveName}" not found.`);
    process.exit(1);
}

// Run the organization process
organizePhotos(sdCardPath, externalHardDrivePath);

console.log('Organizing .JPG and .RAF photos based on the current date...');
