document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('styleForm');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const imagePreview = document.getElementById('imagePreview');
    const uploadText = document.getElementById('uploadText');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const resultsSection = document.getElementById('results-section');
    const resetBtn = document.getElementById('resetBtn');

    // Drag & Drop / File Input Interaction
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect(fileInput.files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFileSelect(fileInput.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                uploadText.style.display = 'none';
                
                // Add a subtle flash effect to indicate success
                dropZone.style.borderColor = 'var(--primary-accent)';
                setTimeout(() => {
                    dropZone.style.borderColor = 'var(--glass-border)';
                }, 500);
            };
            reader.readAsDataURL(file);
        }
    }

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!fileInput.files.length) {
            alert('Please select an image first.');
            return;
        }

        // Set Loading State
        setLoading(true);
        resultsSection.classList.add('hidden'); // Hide previous results

        const formData = new FormData(form);

        try {
            const response = await fetch('http://127.0.0.1:8000/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Artificial delay for "Processing" feel if response is too fast (optional, for dopamine effect)
            // await new Promise(r => setTimeout(r, 800)); 

            renderResults(data);

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing. Please ensure the backend is running at http://127.0.0.1:8000');
        } finally {
            setLoading(false);
        }
    });

    // Reset Form
    resetBtn.addEventListener('click', () => {
        form.reset();
        imagePreview.style.display = 'none';
        imagePreview.src = '';
        uploadText.style.display = 'block';
        resultsSection.classList.add('hidden');
        dropZone.style.borderColor = 'var(--glass-border)';
        // Scroll back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function setLoading(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.innerHTML = '<span class="spinner"></span> Analyzing Style...';
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Generate Analysis';
        }
    }

    // Render Logic
    function renderResults(data) {
        if (!data || !data.analysis) {
            alert('Invalid data received from server.');
            return;
        }

        const analysis = data.analysis;

        // 1. Skin Analysis
        renderSkinAnalysis(analysis.skin);

        // 2. Recommended Colors
        renderColors(analysis.style_recommendation.recommended_colors);

        // 3. Outfit Suggestions
        renderOutfit(analysis.style_recommendation.outfit_suggestions);

        // 4. Accessories
        renderAccessories(analysis.style_recommendation.accessories);

        // 5. Explanation
        document.getElementById('explanationContent').textContent = analysis.style_recommendation.explanation || "No explanation provided.";

        // Reveal Section with slide-up effect
        resultsSection.classList.remove('hidden');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderSkinAnalysis(skin) {
        const container = document.getElementById('skinContent');
        if (!skin) {
            container.innerHTML = '<p>No skin data available.</p>';
            return;
        }

        const rgbString = `rgb(${skin.rgb.r}, ${skin.rgb.g}, ${skin.rgb.b})`;
        
        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                <span class="outfit-label">Detected Tone:</span>
                <div style="background-color: ${rgbString}; width: 60px; height: 30px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);"></div>
            </div>
            <p class="outfit-item"><span class="outfit-label">Undertone:</span> <span class="outfit-value">${skin.undertone}</span></p>
            <p class="outfit-item"><span class="outfit-label">Depth:</span> <span class="outfit-value">${skin.depth}</span></p>
        `;
    }

    function renderColors(colors) {
        const container = document.getElementById('colorsContent');
        container.innerHTML = '';
        
        if (!colors || colors.length === 0) {
            container.innerHTML = '<p>No specific colors recommended.</p>';
            return;
        }

        colors.forEach(color => {
            const wrapper = document.createElement('div');
            wrapper.className = 'swatch-wrapper';

            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            // Simple logic to try and map color names to CSS colors, or use a default gold if unknown for demo
            // In a real app, I'd expect hex codes, but the API spec implies strings like "Navy Blue".
            // CSS handles many color names, but for visual robustness, we might want a mapper or assume valid CSS names.
            swatch.style.backgroundColor = color.toLowerCase().replace(' ', ''); 
            swatch.title = color;

            const label = document.createElement('span');
            label.className = 'color-label';
            label.textContent = color;

            wrapper.appendChild(swatch);
            wrapper.appendChild(label);
            container.appendChild(wrapper);
        });
    }

    function renderOutfit(outfit) {
        const container = document.getElementById('outfitContent');
        if (!outfit) return;

        container.innerHTML = `
            <div class="outfit-item">
                <span class="outfit-label">Top</span>
                <span class="outfit-value" style="text-align: right; width: 60%;">${outfit.top}</span>
            </div>
            <div class="outfit-item">
                <span class="outfit-label">Bottom</span>
                <span class="outfit-value" style="text-align: right; width: 60%;">${outfit.bottom}</span>
            </div>
             <div class="outfit-item" style="border-bottom: none;">
                <span class="outfit-label">Footwear</span>
                <span class="outfit-value" style="text-align: right; width: 60%;">${outfit.footwear}</span>
            </div>
        `;
    }

    function renderAccessories(accessories) {
        const container = document.getElementById('accessoriesContent');
        if (!accessories || accessories.length === 0) {
            container.innerHTML = '<p>No accessories selected.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyleType = 'none';
        ul.style.paddingLeft = '0';

        accessories.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `• ${item}`;
            li.style.marginBottom = '0.5rem';
            li.style.color = 'var(--text-main)';
            ul.appendChild(li);
        });

        container.innerHTML = '';
        container.appendChild(ul);
    }
});
