import json
import locale
import math
import sys
from tabula import read_pdf
import fitz
import pandas as pd
import re
import cv2
from pdf2image import convert_from_path
from pypdf import PdfReader 

locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
sys.stdout.reconfigure(encoding='utf-8')
def detectTables(pdf_path, page_number):
    pages = convert_from_path(pdf_path, dpi=300)  # Adjust dpi for quality
    page = pages[page_number - 1]
    # Save images
    
    image_path = f"page_{page_number}.jpg"  # Save as .jpg or .png
    page.save(image_path, "JPEG")
    
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        ~gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 15, -2
    )

    # Detect horizontal and vertical lines
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    horizontal_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horizontal_kernel)

    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
    vertical_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vertical_kernel)

    # Combine the line images
    table_structure = cv2.addWeighted(horizontal_lines, 0.5, vertical_lines, 0.5, 0)

    # Find contours
    contours, _ = cv2.findContours(table_structure, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Store bounding boxes
    bounding_boxes = [cv2.boundingRect(contour) for contour in contours]

    # Sort by x-coordinate (left to right)
    bounding_boxes.sort(key=lambda b: b[0])

    # Find the first contour with the maximum width
    largest_box = min([b for b in bounding_boxes if b[2] > 500], key=lambda b: b[1], default=None)

    # Extract coordinates
    x, y, w, h = largest_box

    pdf_dpi = 72  # Default DPI in most PDFs
    image_dpi = 300  # Your conversion DPI
    scale_factor = pdf_dpi / image_dpi

    scaled_x = int(x * scale_factor)
    scaled_y = int(y * scale_factor)

    cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)  # Deseneaz? un dreptunghi verde
    cv2.imwrite(f"largest_table_border_with_color{page_number}.jpg", image)
    

    #cv2.imwrite(f"largest_table_border{page_number}.jpg", image)
    
    area = [scaled_y, scaled_x, 800, 900]
    return area

def splitColumns(row):
    not_nan = False
    if not (isinstance(row[0], float) and math.isnan(row[0])):
        not_nan = True
    if not_nan:
        c = True
        if row[0].isupper():
            if len(row[0].split()) >= 2:
                for char in row[0]:
                    if char.isdigit():
                        c = True
                    else:
                        c = False    
            else:
                c = True
        if (c):
            if not (row[0][0].isalpha()) or (row[0][0].islower() and row[0][1] == ' '):
                first_letter_pos = next((i for i, char in enumerate(row[0]) if char.isalpha() and char.isupper()), -1)
                if first_letter_pos != -1:
                    row[0] = row[0][first_letter_pos:]
            match = re.match(r'^(.*?)(?=\s[A-Z0-9])', row[0])
            if match:
                aux = row[0]
                row[2] = row[1]
                row[0] = match.group(1).strip()
                row[1] = aux[len(row[0]):].strip()

    if isinstance(row[1], str):
        if '=' in row[1]:
            row[1] = str(row[1]).replace('=', '')      
    return row

def is_irrelevant_header(row):
    # Check each value in the row
    for value in row:
        if (
            isinstance(value, str) and ("Unnamed" in value or "0" in value)  
            or pd.isna(value)  # If the value is NaN (missing)
            or value.strip() == ''  # If the value is an empty string (after stripping spaces)
        ):
            return True   # Move to the next value since this one is irrelevant
        # If we find at least one meaningful value, return False  
    return False  # If all values in the row were irrelevant, return True
def check_irrelevant_header(df):
    if is_irrelevant_header(df.columns):                 
        row_idx = 0
        while row_idx < len(df):
            current_row = df.iloc[row_idx].tolist()                      
            split_row = splitColumns(current_row)
            split_row = pd.Series(split_row)
            # Check if the row has any irrelevant values (i.e., no NaNs or empty strings)
            if not is_irrelevant_header(split_row):
                # Set the found valid row as the header
                df.columns = split_row
                # Drop all rows up to and including the new header
                df = df.iloc[row_idx+1:].reset_index(drop=True)
                return df
            # Move to the next row if the current row is not valid
            row_idx += 1
    return df

                                   
def process_pdf(pdf_file):
    # Get date of report
    for block in PdfReader(pdf_file).pages[0].extract_text().split("\n"):
        if "Data" in block:
            date_match = re.search(r"\b\d{2}[./-]\d{2}[./-]\d{4}\b", block)
            if date_match:
                date = date_match.group()  # Extract the matched date
            break      
    # Get data from tables
    pdf_document = fitz.open(pdf_file)
    total_pages = len(pdf_document)
    all_tables = []
    
    for page_number in range(1, total_pages+1):
        try:       
            current_area = detectTables(pdf_file, page_number)
            tables = read_pdf(pdf_file, pages=str(page_number), encoding="utf-8" , area=current_area, guess=False)                       
            for table in tables:
                df = pd.DataFrame(table)
                df.columns = splitColumns(list(df.columns))
                df = df.astype('object')
                df = df.dropna(how='all')
                df = check_irrelevant_header(df)                      
                for index, row in df.iterrows():
                    modified_row   = splitColumns(list(row))
                    df.loc[index] = modified_row
                
                def count_matching_values(row, header):
                    return sum([1 for val, header_val in zip(row, header) if val == header_val])
                # Remove rows that match the header in at least `threshold` positions
                df = df[~df.apply(lambda row: count_matching_values(row, df.columns) >= 3, axis=1)].reset_index(drop=True)

                df.drop(columns=df.columns[df.isna().all()], inplace=True)
                df = df.dropna(thresh=len(df.columns) - 1)
                df.columns = ["Test", "Rezultat", "UM", "Interval de referinta"]        
                table_json = df.to_json(orient="records", force_ascii=False)
                all_tables.extend(json.loads(table_json))
        except Exception as e:
            print(f"Error processing page {page_number}: {e}")
    #return (json.dumps(all_tables, ensure_ascii=False))
    return {
        "tables": json.dumps(all_tables, ensure_ascii=False),
        "date": date,
    }

# if __name__ == "__main__":
#     try:
#         pdf_file = sys.argv[1]
#         print(process_pdf(pdf_file))
#     except Exception as e:
#         print(f"Error processing PDF: {str(e)}", file=sys.stderr)
#         sys.exit(1)


pdf_file = "C:\\Users\\CiangauRalucaElena\\Desktop\\pdf-test\\Buletin-de-Analize-21492140.pdf"
print(process_pdf(pdf_file))