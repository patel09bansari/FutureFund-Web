/*
 * js/planner.js
 * Handles the multi-step form logic, auto-saving to local storage, and navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Auto-fill forms from local storage if data exists
    const form = document.querySelector('form');
    if (!form) return;

    const step = form.getAttribute('data-step');
    const storageKey = `planner_step${step}`;
    
    // Restore data
    const savedData = FutureFundStorage.get(storageKey);
    if (savedData && step !== "5") { // Step 5 is handled manually due to dynamic inputs
        Object.keys(savedData).forEach(key => {
            const input = form.elements[key];
            if (input) {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    const match = Array.from(form.elements[key]).find(r => r.value === savedData[key]);
                    if (match) match.checked = true;
                } else {
                    input.value = savedData[key];
                }
            }
        });
    }

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let formData = {};
        
        if (step === "5") {
            // Custom serialization for dynamic goals
            const names = form.elements['goalName[]'];
            const amounts = form.elements['goalAmount[]'];
            const years = form.elements['goalYear[]'];
            const priorities = form.elements['goalPriority[]'];
            
            let goals = [];
            
            // Normalize to arrays if single element
            const toArray = (obj) => obj.length === undefined ? [obj] : Array.from(obj);
            
            const nArr = toArray(names);
            const aArr = toArray(amounts);
            const yArr = toArray(years);
            const pArr = toArray(priorities);
            
            for(let i=0; i<nArr.length; i++) {
                goals.push({
                    name: nArr[i].value,
                    amount: parseFloat(aArr[i].value),
                    year: parseInt(yArr[i].value),
                    priority: pArr[i].value
                });
            }
            formData = { goals };
        } else {
            // Standard form serialization
            const data = new FormData(form);
            for (let [key, value] of data.entries()) {
                formData[key] = value;
            }
        }
        
        // Save to local storage
        FutureFundStorage.save(storageKey, formData);
        
        // Navigation
        if (step === "6") {
            // Trigger Intelligence Engine and Redirect to Report
            window.location.href = '../report.html';
        } else {
            const nextStep = parseInt(step) + 1;
            // Map step numbers to filenames
            const fileMap = {
                2: 'step2-income.html',
                3: 'step3-expenses.html',
                4: 'step4-position.html',
                5: 'step5-goals.html',
                6: 'step6-risk.html'
            };
            window.location.href = fileMap[nextStep];
        }
    });

    // Auto-save on blur for text/number inputs
    const inputs = form.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            // Only auto-save if not on step 5 (complex arrays)
            if(step !== "5") {
                const data = new FormData(form);
                let obj = {};
                for (let [key, value] of data.entries()) {
                    obj[key] = value;
                }
                FutureFundStorage.save(storageKey, obj);
            }
        });
    });
});
