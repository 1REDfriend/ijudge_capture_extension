document.getElementById('saveButton').addEventListener('click', async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const activeTab = tabs[0];
            console.log("Active Tab ID:", activeTab.id); // Debugging log

            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: () => {
                    console.log('Extract HTML function called'); // Log to ensure function execution

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

                        async function goToNextPage() {
                            const nextPageButton = document.querySelector('button[aria-label^="Go to page"]:not([aria-current="true"])');
                            if (nextPageButton) {
                                nextPageButton.click();
                                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for content to load
                                return true;
                            }
                            return false;
                        }

                        const paginationList = document.querySelectorAll('ul.MuiPagination-ul.mui-nhb8h9 li'); // Select all <li> elements in the pagination <ul>
                        for (let i = 0; i < paginationList.length; i++) {
                            const currentPageTestCases = extractCurrentPage();
                            testCases.push(...currentPageTestCases);
                            if (i < paginationList.length - 1) { // Navigate to next page only if there is a next page
                                await goToNextPage();
                            }
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
                            combinedMarkdown += `**Input**\n\n${testCases[i].content}\n\n`;

                            if (i + 1 < testCases.length) {
                                combinedMarkdown += `**Expected Output**\n\n${testCases[i + 1].content}\n\n`;
                            }

                            counter++;
                        }

                        console.log('Final Markdown Content:', combinedMarkdown);
                        return { combinedMarkdown, headerText };
                    }

                    return extractAndCombineContent();
                }
            }, (result) => {
                console.log("Execution Result:", result); // Debugging log
                if (chrome.runtime.lastError || !result || !result[0]) {
                    console.error("Error extracting HTML:", chrome.runtime.lastError);
                    return;
                }
                const { combinedMarkdown, headerText } = result[0].result;
                const blob = new Blob([combinedMarkdown], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                chrome.downloads.download({
                    url: url,
                    filename: `${headerText}.md`
                });
            });
        } else {
            console.error("No active tab found");
        }
    });
});