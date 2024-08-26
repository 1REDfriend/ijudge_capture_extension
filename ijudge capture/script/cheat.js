chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'cheat') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const activeTab = tabs[0];
                const url = activeTab.url;

                if (!url || !url.startsWith("https://ijudge.it.kmitl.ac.th/problems")) {
                    console.error("The URL does not match the required pattern or is undefined");
                    sendResponse({ success: false, error: "URL pattern mismatch or undefined URL" });
                    return;
                }

                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    function: async () => {
                        async function getParagraphsAllHTML(element) {
                            if (!element) {
                                return ' ';
                            }

                            let content = '';
                            const paragraphs = element.querySelectorAll('p');

                            for (const paragraph of paragraphs) {
                                content += paragraph.innerText + '\n\n';

                                const images = paragraph.querySelectorAll('img');
                                for (const image of images) {
                                    const imgMarkdown = `![${image.alt}](${image.src})`;
                                    content += imgMarkdown + '\n\n';
                                }
                            }

                            return content;
                        }

                        async function extractHTML() {
                            try {
                                const headerElement = document.querySelector('h4.MuiTypography-root.MuiTypography-h4.mui-nubt7n');
                                const inputSpecificationElements = document.querySelectorAll('div#previewmd-preview');

                                const headerText = headerElement ? headerElement.textContent.trim() : ' ';
                                let inputSpecificationText = '';
                                let counter = 0;
                                for (const element of inputSpecificationElements) {
                                    counter += 1;
                                    if (counter === 2) {
                                        inputSpecificationText += "### Input Specification\n\n";
                                    } else if (counter === 3) {
                                        inputSpecificationText += "### Output Specification\n\n";
                                    }
                                    inputSpecificationText += await getParagraphsAllHTML(element);
                                }

                                const markdownContent = `# ${headerText}\n\n${inputSpecificationText}`;
                                console.log('Generated Markdown Content:', markdownContent);

                                return { markdownContent, headerText };
                            } catch (error) {
                                console.error('Error in extractHTML:', error);
                                return { markdownContent: "element error", headerText: "error" };
                            }
                        }

                        async function extractTestCases() {
                            const testCases = [];

                            function extractCurrentPage() {
                                const inputs = document.querySelectorAll('h6.MuiTypography-root.MuiTypography-subtitle1.MuiTypography-gutterBottom.mui-oifmiu');
                                const preElements = document.querySelectorAll('pre.overflow-x-auto.rounded.border.p-2.bg-gray-100.whitespace-pre-wrap');

                                const pageTestCases = [];
                                for (let i = 0; i < inputs.length; i++) {
                                    const input = inputs[i];
                                    const pre = preElements[i];

                                    if (input && pre) {
                                        const title = input.textContent.trim();
                                        const content = pre.textContent.trim();
                                        pageTestCases.push({ title, content });
                                    }
                                }

                                return pageTestCases;
                            }

                            async function isLastPage() {
                                const currentPageButton = document.querySelector('button[aria-current="true"]');

                                if (currentPageButton) {
                                    const currentPageNumber = parseInt(currentPageButton.getAttribute('aria-label').replace('page ', ''), 10);

                                    const lastPageButton = document.querySelector('ul.MuiPagination-ul.mui-nhb8h9 li:last-child button');
                                    const lastPageNumber = lastPageButton ? parseInt(lastPageButton.getAttribute('aria-label').replace('page ', ''), 10) : null;

                                    if (currentPageNumber === lastPageNumber) {
                                        return true;
                                    }
                                }
                                return false;
                            }

                            async function goToNextPage(i) {
                                const nextPageButton = document.querySelector(`button[aria-label^="Go to page ${i + 1}"]:not([aria-current="true"])`);
                                if (nextPageButton) {
                                    nextPageButton.click();
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    return true;
                                }
                                if (await isLastPage()) {
                                    return false;
                                }
                                return true;
                            }

                            const paginationList = document.querySelectorAll('ul.MuiPagination-ul.mui-nhb8h9 li');
                            let pageCount = 0;
                            while (true) {
                                const currentPageTestCases = extractCurrentPage();
                                testCases.push(...currentPageTestCases);
                                const pageRespon = await goToNextPage(pageCount);
                                if (!pageRespon) {
                                    break;
                                }
                                pageCount++;
                            }
                            if (paginationList.length <= 0) {
                                const currentPageTestCases = extractCurrentPage();
                                testCases.push(...currentPageTestCases);
                            }

                            return testCases;
                        }

                        async function extractAndCombineContent() {
                            const { markdownContent: markdownHeader, headerText } = await extractHTML();
                            const testCases = await extractTestCases();

                            let combinedMarkdown = markdownHeader;
                            let counter = 1;

                            for (let i = 0; i < testCases.length; i += 2) {
                                combinedMarkdown += `\n\n### Test Case ${counter}\n\n`;
                                combinedMarkdown += `**Input**\n\n`;

                                combinedMarkdown += "```\n";
                                combinedMarkdown += `${testCases[i].content}\n`;
                                combinedMarkdown += "```\n";

                                if (i + 1 < testCases.length) {
                                    combinedMarkdown += `**Expected Output**\n\n`;
                                    combinedMarkdown += "```\n";
                                    combinedMarkdown += `${testCases[i + 1].content}\n`;
                                    combinedMarkdown += "```\n";
                                }

                                counter++;
                            }

                            console.log('Final Markdown Content:', combinedMarkdown);
                            return { combinedMarkdown, headerText };
                        }

                        return extractAndCombineContent();
                    }
                }, (result) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error sending message to content script:", chrome.runtime.lastError.message);
                        sendResponse({ success: false, error: chrome.runtime.lastError.message });
                    } else if (!result || !result[0] || result[0].result.error) {
                        console.error("Error in result:", result[0]?.result?.error || "Unknown error");
                        sendResponse({ success: false, error: result[0]?.result?.error || "Unknown error" });
                    } else {
                        const { combinedMarkdown, headerText } = result[0].result;
                        const blob = new Blob([combinedMarkdown], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        chrome.downloads.download({
                            url: url,
                            filename: `${headerText}.md`
                        }, () => {
                            if (chrome.runtime.lastError) {
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                            } else {
                                sendResponse({ success: true });
                            }
                        });
                    }
                });
            } else {
                console.error("No active tab found");
                sendResponse({ success: false, error: "No active tab found" });
            }
        });

        return true; // Ensure this is present to keep the message port open
    }
});
