
import { metacognaProfile } from "../data/profile";

export const generateProspectusPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // --- CONFIGURATION ---
    const margin = 20;
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);
    let y = 20;

    // Colors (RGB)
    const COLOR_INK = [24, 24, 27];      // #18181b
    const COLOR_ACCENT = [16, 185, 129]; // #10b981 (Emerald)
    const COLOR_PAPER = [255, 255, 255]; // #ffffff
    const COLOR_SURFACE = [244, 244, 245]; // #f4f4f5
    const COLOR_LINK = [37, 99, 235];    // #2563eb (Blue)

    // --- HELPERS ---

    const setFont = (type: 'heading' | 'subheading' | 'body' | 'mono' | 'mono-bold', size: number = 10, color: number[] = COLOR_INK) => {
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFontSize(size);
        switch (type) {
            case 'heading': doc.setFont("times", "bold"); break; 
            case 'subheading': doc.setFont("helvetica", "bold"); break;
            case 'body': doc.setFont("helvetica", "normal"); break;
            case 'mono': doc.setFont("courier", "normal"); break; 
            case 'mono-bold': doc.setFont("courier", "bold"); break;
        }
    };

    const drawHardShadowRect = (x: number, y: number, w: number, h: number, fillColor: number[], shadowColor: number[] = COLOR_INK) => {
        // Shadow
        doc.setFillColor(shadowColor[0], shadowColor[1], shadowColor[2]);
        doc.rect(x + 1.5, y + 1.5, w, h, 'F');
        // Main
        doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
        doc.setDrawColor(shadowColor[0], shadowColor[1], shadowColor[2]);
        doc.setLineWidth(0.5);
        doc.rect(x, y, w, h, 'FD');
    };

    const checkPage = (heightNeeded: number) => {
        if (y + heightNeeded > pageHeight - margin) {
            doc.addPage();
            y = 20;
            // Header for continuation pages
            doc.setFillColor(COLOR_SURFACE[0], COLOR_SURFACE[1], COLOR_SURFACE[2]);
            doc.rect(0, 0, pageWidth, 15, 'F');
            setFont('mono-bold', 8, [150, 150, 150]);
            doc.text("METACOGNA_LAB // CONTINUATION_SHEET", margin, 10);
            y = 30;
        }
    };

    const addSectionHeader = (title: string, subtitle?: string) => {
        checkPage(25);
        
        // Stylish Divider
        doc.setDrawColor(COLOR_INK[0], COLOR_INK[1], COLOR_INK[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + contentWidth, y);
        
        // Green accent block under line
        doc.setFillColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
        doc.rect(margin, y, 6, 6, 'F');

        y += 8;

        setFont('mono-bold', 12, COLOR_INK);
        doc.text(title.toUpperCase(), margin + 10, y);
        
        if (subtitle) {
            y += 5;
            setFont('mono', 9, [100, 100, 100]);
            doc.text(subtitle, margin + 10, y);
        }
        
        y += 12;
    };

    const addWrappedText = (text: string, size: number, type: 'body' | 'mono', color: number[], indent: number = 0, maxWidth?: number) => {
        setFont(type, size, color);
        const lineHeight = size / 2.5; 
        const limit = maxWidth || (contentWidth - indent);
        const lines = doc.splitTextToSize(text, limit);
        checkPage(lines.length * lineHeight);
        doc.text(lines, margin + indent, y);
        y += (lines.length * lineHeight) + 3;
    };

    // --- DOCUMENT CONTENT ---

    // 1. BRAND HEADER
    // Left Box: Branding
    drawHardShadowRect(margin, y, 110, 35, COLOR_ACCENT, COLOR_INK);
    
    doc.setTextColor(COLOR_INK[0], COLOR_INK[1], COLOR_INK[2]);
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text("METACOGNA LAB", margin + 6, y + 14);
    
    setFont('mono-bold', 10, COLOR_INK);
    doc.text("STRATEGIC PROSPECTUS // V.2025", margin + 6, y + 24);
    
    // Right Box: Address (Positioned safely to avoid overlap)
    // Address start X ensures at least 10mm gap from the branding box
    const brandingBoxWidth = 110;
    const addressStartX = margin + brandingBoxWidth + 10; 
    let addrY = y + 5;
    
    setFont('mono-bold', 9, COLOR_INK);
    
    const addressLines = [
        metacognaProfile.contact.entityName,
        metacognaProfile.contact.email,
        metacognaProfile.contact.address.planet,
        metacognaProfile.contact.address.system,
        metacognaProfile.contact.address.galaxy
    ];
    
    // Right align the address block to the page margin
    addressLines.forEach(line => {
        doc.text(line, pageWidth - margin, addrY, { align: "right" });
        addrY += 5;
    });

    y += 50;

    // 2. MISSION STATEMENT
    // Styled as a "Terminal" or "Card"
    const missionText = metacognaProfile.methodology.description;
    
    // Calculate box height dynamically based on text wrapping
    // Reducing wrapping width significantly to ensure padding
    const wrapWidth = contentWidth - 20; 
    setFont('mono', 10, COLOR_INK); // Set font for calculation
    const splitMission = doc.splitTextToSize(missionText, wrapWidth);
    const boxHeight = (splitMission.length * 5) + 30; // + padding
    
    drawHardShadowRect(margin, y, contentWidth, boxHeight, COLOR_PAPER, COLOR_INK);
    
    // Badge Label inside
    doc.setFillColor(COLOR_INK[0], COLOR_INK[1], COLOR_INK[2]);
    doc.rect(margin + 5, y + 5, 35, 6, 'F');
    setFont('mono-bold', 8, COLOR_PAPER);
    doc.text("MISSION_LOG", margin + 7, y + 9);
    
    // Mission Text
    setFont('mono', 10, COLOR_INK);
    doc.text(splitMission, margin + 10, y + 20);

    y += boxHeight + 15;

    // 3. METHODOLOGY
    addSectionHeader("01 // METHODOLOGY", "Controlled Chaos & Rigorous Design");
    
    // Tagline quote style
    doc.setDrawColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin, y + 10); // Left green border
    
    addWrappedText(`"${metacognaProfile.methodology.tagline}"`, 11, 'body', COLOR_INK, 6);
    y += 5;
    addWrappedText(metacognaProfile.methodology.cyclePhilosophy, 10, 'mono', [80, 80, 80], 6);
    y += 10;

    // 4. SERVICE ARCHITECTURE
    // Explicit Ordering: Creative -> Solutions -> Ops -> Technical
    addSectionHeader("02 // SERVICE ARCHITECTURE", "The Operational Stack");

    const categories = [
        { 
            title: "I. CREATIVE SOLUTION DEVELOPMENT", 
            subtitle: "The Tangent Engine",
            icon: "spark",
            items: metacognaProfile.services.creativeSolutions 
        },
        { 
            title: "II. SOLUTIONS ARCHITECTURE", 
            subtitle: "The Blueprint",
            icon: "blueprint",
            items: metacognaProfile.services.solutionsDesign 
        },
        { 
            title: "III. EXECUTIVE OPERATIONS", 
            subtitle: "The C-Suite",
            icon: "ops",
            items: metacognaProfile.services.executiveOps 
        },
        { 
            title: "IV. TECHNICAL EXECUTION", 
            subtitle: "High-Fidelity Build", 
            icon: "code",
            items: metacognaProfile.services.technical 
        }
    ];

    categories.forEach(cat => {
        checkPage(30);
        
        // Category Header Strip
        doc.setFillColor(COLOR_INK[0], COLOR_INK[1], COLOR_INK[2]);
        doc.rect(margin, y, contentWidth, 10, 'F');
        
        setFont('mono-bold', 10, COLOR_PAPER);
        doc.text(cat.title, margin + 4, y + 6);
        
        setFont('mono', 8, COLOR_ACCENT);
        const subWidth = doc.getTextWidth(cat.subtitle);
        // Ensure subtitle doesn't overlap title if title is long
        if (pageWidth - margin - subWidth - 4 > margin + 80) {
             doc.text(`// ${cat.subtitle}`, pageWidth - margin - subWidth - 4, y + 6);
        }

        y += 15;

        cat.items.forEach(item => {
            checkPage(35);
            
            // Service Item Title
            // Small accent square
            doc.setFillColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
            doc.rect(margin + 2, y - 2.5, 2, 2, 'F');
            
            setFont('subheading', 11, COLOR_INK);
            doc.text(item.name, margin + 6, y);
            
            // Link Indicator (If available)
            if (item.link) {
                const linkLabel = " [VISIT SITE]";
                const titleWidth = doc.getTextWidth(item.name);
                setFont('mono-bold', 8, COLOR_LINK);
                doc.textWithLink(linkLabel, margin + 6 + titleWidth, y, { url: item.link });
            }

            y += 5;
            
            // Description
            // Increased indent for visual hierarchy
            addWrappedText(item.description, 9, 'body', [60, 60, 60], 6);
            
            // Tags
            setFont('mono', 8, [120, 120, 120]);
            doc.text(`[${item.tags.join('] [')}]`, margin + 6, y);
            y += 10;
        });
        y += 5;
    });

    // 5. ENGAGEMENT MODELS
    addSectionHeader("03 // ENGAGEMENT MODELS", "Time-Boxed Value Delivery");

    metacognaProfile.engagementModels.forEach(model => {
        checkPage(40);
        
        // Use a safer manual height calculation or fixed height based on content
        // Calculating text heights first
        setFont('mono', 9, [80, 80, 80]); // For deliverables
        const delivText = `DELIVERABLES: ${model.deliverables.join(" // ")}`;
        const splitDeliv = doc.splitTextToSize(delivText, contentWidth - 6);
        const delivHeight = splitDeliv.length * 4;
        
        const boxH = 30 + delivHeight; // Header + Focus + Deliv + padding

        doc.setDrawColor(COLOR_INK[0], COLOR_INK[1], COLOR_INK[2]);
        doc.setLineWidth(0.5);
        doc.rect(margin, y, contentWidth, boxH);
        
        // Header line inside box
        doc.setFillColor(COLOR_SURFACE[0], COLOR_SURFACE[1], COLOR_SURFACE[2]);
        doc.rect(margin + 0.5, y + 0.5, contentWidth - 1, 8, 'F');
        doc.line(margin, y + 9, margin + contentWidth, y + 9);

        // Title
        setFont('mono-bold', 10, COLOR_INK);
        doc.text(model.name.toUpperCase(), margin + 3, y + 6);
        
        // Duration Badge
        setFont('mono-bold', 9, COLOR_ACCENT);
        const durationText = `DURATION: ${model.duration}`;
        doc.text(durationText, pageWidth - margin - doc.getTextWidth(durationText) - 3, y + 6);
        
        // Content
        let innerY = y + 15;
        setFont('body', 10, COLOR_INK);
        doc.text(`FOCUS: ${model.focus}`, margin + 3, innerY);
        innerY += 6;
        
        setFont('mono', 9, [80, 80, 80]);
        doc.text(splitDeliv, margin + 3, innerY);
        
        y += boxH + 8;
    });

    // 6. CLOSING / FOOTER
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Bottom Line
        doc.setDrawColor(COLOR_INK[0], COLOR_INK[1], COLOR_INK[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        setFont('mono-bold', 8, [150, 150, 150]);
        const dateStr = new Date().toISOString().split('T')[0];
        doc.text(`PAGE ${i} OF ${pageCount} // GENERATED: ${dateStr}`, margin, pageHeight - 10);
        doc.text("METACOGNA LAB // CONFIDENTIAL", pageWidth - margin - 50, pageHeight - 10);
    }

    doc.save("Metacogna_Prospectus_2025.pdf");
};
