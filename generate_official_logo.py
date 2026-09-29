import subprocess
import os

def generate_logo():
    # High-resolution 1000x1000 canvas
    # 1. Base circles and turquoise disc
    # Canvas center is (500, 500)
    # Radii:
    # Outer thin circle: r = 465
    # Thick circle: r = 445 (strokewidth 14)
    # Inner circle: r = 270 (strokewidth 6)
    
    cmd_base = """
    convert -size 1000x1000 xc:white \
      -stroke '#111827' -strokewidth 4 -fill none -draw 'circle 500,500 500,35' \
      -stroke '#111827' -strokewidth 14 -fill none -draw 'circle 500,500 500,58' \
      -stroke '#111827' -strokewidth 6 -fill '#8cd4d4' -draw 'circle 500,500 500,230' \
      -fill '#111827' -stroke none -font 'Nimbus-Sans-Bold' -pointsize 102 -gravity center -annotate +0+5 'MPGBSIM' \
      -font 'Liberation-Serif-Bold' -pointsize 72 -gravity south -annotate +0+78 '1988' \
      -font 'Liberation-Serif-Bold' -pointsize 70 -gravity south -annotate -195+115 '*' \
      -font 'Liberation-Serif-Bold' -pointsize 70 -gravity south -annotate +195+115 '*' \
      step1_base.png
    """
    subprocess.run(cmd_base, shell=True, check=True)

    # 2. Render Jawi text along upper arc
    # Text length and spacing tuned to fit the 235-degree arc from 4 o'clock to 8 o'clock
    jawi_text = "مجليس فغتوا  ݢورو بسر  سکوله - سکوله  اسلام مليسيا"
    
    cmd_arc = f"""
    convert -size 1500x100 xc:transparent \
      -font 'KacstTitle' -pointsize 54 -fill '#111827' -gravity center \
      -annotate +0+0 '{jawi_text}' \
      -virtual-pixel transparent -distort Arc '240 0 355 265' \
      step2_arc.png
    """
    subprocess.run(cmd_arc, shell=True, check=True)

    # 3. Composite the arc text cleanly centered onto the base logo
    cmd_composite = """
    convert step1_base.png step2_arc.png -gravity center -composite public/mpgbsim-official-logo.png
    """
    subprocess.run(cmd_composite, shell=True, check=True)

    # Copy to all expected locations
    subprocess.run("cp public/mpgbsim-official-logo.png public/mpgbsim-logo.png", shell=True)
    subprocess.run("cp public/mpgbsim-official-logo.png public/mpgbsim-logo.jpg", shell=True)
    
    print("MPGBSIM official logo generated successfully at 1000x1000 resolution.")

if __name__ == '__main__':
    generate_logo()
