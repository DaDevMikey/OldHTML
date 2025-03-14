// Detect browser capabilities and add appropriate classes
function detectBrowser() {
    var isModern = false;
    var browserInfo = "Unknown browser";

    // Basic browser detection
    if (navigator) {
        browserInfo = "Browser: " + (navigator.userAgent || "Unknown");
        
        // Check for modern features
        if (window.XMLHttpRequest && 
            document.querySelector && 
            Array.prototype.forEach && 
            window.JSON) {
            isModern = true;
        }
    }
    
    // Apply modern class if supported
    if (isModern) {
        document.body.className += " modern";
        
        // Initialize theme based on user preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
        }
        
        // Set up theme toggle
        var themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                document.body.classList.toggle('dark-theme');
            });
        }
        
        // Set up style toggle
        var styleToggle = document.getElementById('style-toggle');
        if (styleToggle) {
            styleToggle.addEventListener('click', function() {
                document.body.classList.toggle('legacy-style');
                this.textContent = document.body.classList.contains('legacy-style') ? 
                    'Modern View' : 'Legacy View';
            });
        }
    }
    
    // Update browser info
    var infoElement = document.getElementById("browser-info");
    if (infoElement) {
        infoElement.innerHTML = browserInfo + (isModern ? " (Modern features detected)" : " (Basic compatibility mode)");
    }
    
    // Show compatibility info
    populateBrowserCompatibility();
}

// Populate browser compatibility information
function populateBrowserCompatibility() {
    var compatList = document.getElementById("browser-compatibility");
    if (!compatList) return;
    
    var browsers = [
        { name: "Internet Explorer 1.0-5.5", features: "Legacy view only" },
        { name: "Internet Explorer 6.0-8.0", features: "Legacy view with basic functionality" },
        { name: "Internet Explorer 9.0+", features: "Modern view with limitations" },
        { name: "Firefox 3.5+", features: "Full functionality" },
        { name: "Chrome 4+", features: "Full functionality" },
        { name: "Safari 4+", features: "Full functionality" },
        { name: "Opera 10.5+", features: "Full functionality" }
    ];
    
    var html = "";
    for (var i = 0; i < browsers.length; i++) {
        html += "<li><strong>" + browsers[i].name + "</strong>: " + browsers[i].features + "</li>";
    }
    
    compatList.innerHTML = html;
}

// Fetch repository data
function fetchRepoData() {
    var repoUrl = "https://api.github.com/repos/DaDevMikey/OldHTML/contents";
    var dataContainer = document.getElementById("repo-data");
    var fileSelector = document.getElementById("file-selector");
    
    if (!dataContainer) return;
    
    dataContainer.innerHTML = "Loading repository data...";
    
    httpRequest(repoUrl, function(response, error) {
        if (error) {
            dataContainer.innerHTML = "Error loading repository: " + error;
            return;
        }
        
        try {
            var data = JSON.parse(response);
            
            if (data && data.length) {
                var html = "<ul>";
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    html += "<li><a href='javascript:void(0)' onclick='viewFile(\"" + 
                           item.path + "\", \"" + item.download_url + "\")'>" + 
                           item.name + "</a> (" + item.type + ")</li>";
                    
                    // Add to file selector dropdown
                    if (fileSelector && item.type !== 'dir') {
                        var option = document.createElement('option');
                        option.value = item.download_url;
                        option.setAttribute('data-path', item.path);
                        option.textContent = item.path;
                        fileSelector.appendChild(option);
                    }
                }
                html += "</ul>";
                dataContainer.innerHTML = html;
                
                // Set up view button
                if (fileSelector) {
                    var viewButton = document.getElementById('view-file');
                    if (viewButton) {
                        viewButton.onclick = function() {
                            if (fileSelector.value) {
                                var path = fileSelector.options[fileSelector.selectedIndex].getAttribute('data-path');
                                viewFile(path, fileSelector.value);
                            }
                        };
                    }
                }
            } else {
                dataContainer.innerHTML = "No files found in repository.";
            }
        } catch (e) {
            dataContainer.innerHTML = "Error parsing repository data.";
        }
    });
}

// View a file from the repository
function viewFile(path, url) {
    var contentContainer = document.getElementById("file-content");
    
    if (!contentContainer) return;
    
    contentContainer.innerHTML = "Loading file: " + path + "...";
    
    httpRequest(url, function(response, error) {
        if (error) {
            contentContainer.innerHTML = "Error loading file: " + error;
            return;
        }
        
        // Simple file type detection
        var isHTML = path.toLowerCase().endsWith('.html') || path.toLowerCase().endsWith('.htm');
        var isImage = path.toLowerCase().match(/\.(jpe?g|png|gif|bmp|svg)$/i);
        
        if (isHTML) {
            // Create iframe for HTML content
            contentContainer.innerHTML = '<iframe id="html-preview" style="width:100%;height:100%;border:none;"></iframe>';
            var iframe = document.getElementById('html-preview');
            var doc = iframe.contentWindow.document;
            doc.open();
            doc.write(response);
            doc.close();
        } else if (isImage) {
            // Display image
            contentContainer.innerHTML = '<div style="text-align:center"><img src="' + url + '" style="max-width:100%;max-height:380px;" alt="' + path + '"></div>';
        } else {
            // Display as text with basic syntax highlighting
            var content = response.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            // Very basic syntax highlighting for common file types
            if (path.toLowerCase().endsWith('.js')) {
                content = highlightJS(content);
            } else if (path.toLowerCase().endsWith('.css')) {
                content = highlightCSS(content);
            }
            
            contentContainer.innerHTML = '<pre style="margin:0;white-space:pre-wrap;">' + content + '</pre>';
        }
    });
}

// Very basic syntax highlighting for JS
function highlightJS(code) {
    // Just a simple example - a real implementation would be more robust
    return code
        .replace(/(\/\/.*)/g, '<span style="color:#008000;">$1</span>')
        .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span style="color:#a31515;">$&</span>')
        .replace(/\b(function|var|let|const|return|if|else|for|while|new|this|null|undefined)\b/g, 
                '<span style="color:#0000ff;">$1</span>');
}

// Very basic syntax highlighting for CSS
function highlightCSS(code) {
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '<span style="color:#008000;">$&</span>')
        .replace(/([a-z-]+):/g, '<span style="color:#ff0000;">$1</span>:')
        .replace(/(#[0-9a-f]{3,6})\b/gi, '<span style="color:#0000ff;">$1</span>');
}

// Search repository
function searchRepo() {
    var searchInput = document.getElementById("search");
    var resultsContainer = document.getElementById("search-results");
    
    if (!searchInput || !resultsContainer) return;
    
    var searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        resultsContainer.innerHTML = "";
        return;
    }
    
    resultsContainer.innerHTML = "Searching...";
    
    // GitHub search API
    var searchUrl = "https://api.github.com/search/code?q=" + 
                   encodeURIComponent(searchTerm) + 
                   "+repo:DaDevMikey/OldHTML";
    
    httpRequest(searchUrl, function(response, error) {
        if (error) {
            resultsContainer.innerHTML = "Search error: " + error;
            return;
        }
        
        try {
            var data = JSON.parse(response);
            
            if (data && data.items && data.items.length) {
                var html = "<h3>Search Results</h3><ul>";
                for (var i = 0; i < data.items.length; i++) {
                    var item = data.items[i];
                    html += "<li><a href='" + item.html_url + "'>" + 
                            item.path + "</a></li>";
                }
                html += "</ul>";
                resultsContainer.innerHTML = html;
            } else {
                resultsContainer.innerHTML = "No results found for '" + searchTerm + "'.";
            }
        } catch (e) {
            resultsContainer.innerHTML = "Error processing search results.";
        }
    });
}

// Initialize
window.onload = function() {
    detectBrowser();
    fetchRepoData();
    
    // Set up search on Enter key
    var searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.onkeypress = function(e) {
            if (!e) e = window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == 13) {
                searchRepo();
                return false;
            }
        };
    }
};
