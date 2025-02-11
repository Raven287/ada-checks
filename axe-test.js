const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);  // Using promisify to use readdir as a promise

const currentWorkingDirectory = process.cwd();

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Get the public directory path
  const publicDir = path.join(currentWorkingDirectory, 'public');

  // Get all files in the public folder
  const files = await readdir(publicDir);

  // Filter out only the .html files
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  console.log('Found HTML files:', htmlFiles);

  // Initialize an array to store results
  const allResults = [];

  // Loop through each HTML file and run axe on it
  for (const file of htmlFiles) {
    const filePath = path.join(publicDir, file);
    
    // Construct the file URL with file:// protocol
    const fileUrl = 'file://' + filePath.replace(/ /g, '%20');  // URL encode spaces

    // Log which file we're checking
    console.log(`Running accessibility check on: ${file}`);

    // Open the file in Puppeteer (using the file:// URL)
    await page.goto(fileUrl);

    // Inject axe-core into the page
    await page.addScriptTag({
      path: require.resolve('axe-core')
    });

    // Run axe-core in the page context
    const results = await page.evaluate(async () => {
      return await axe.run();
    });

    // Collect the results
    allResults.push({
      file: file,
      violations: results.violations
    });
  }

  // Output all results after checking all files
  console.log('\nAccessibility Check Results:');
  let hasViolations = false;
  allResults.forEach(result => {
    if (result.violations.length > 0) {
      console.log(result.file);
      console.log(result.violations);
      console.log("end of the file",result.file)
      hasViolations = true;
    }
  });

  // If violations were found, exit with failure
  if (hasViolations) {
    process.exit(1);  // Fail the build if violations exist
  } else {
    console.log('\nNo accessibility violations found.');
  }

  await browser.close();
})();
