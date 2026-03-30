from pathlib import Path

from PIL import Image


def main() -> None:
    src = Path(
        r"C:\Users\jens\.cursor\projects\d-dev-Web-bilderplan\assets\c__Users_jens_AppData_Roaming_Cursor_User_workspaceStorage_44d97989f2e4b2e5316877fb50fc8aa0_images_Unbenannt-1eb64f9a-c646-411d-abe1-d9a3918e80cf.png"
    )
    dst = Path(r"d:\dev\Web\bilderplan\public\favicon.ico")

    img = Image.open(src).convert("RGBA")

    # Ensure square canvas and add padding so the dots don't touch the edges.
    w, h = img.size
    side = max(w, h)
    pad = int(side * 0.10)
    canvas_side = side + pad * 2
    canvas = Image.new("RGBA", (canvas_side, canvas_side), (0, 0, 0, 0))
    canvas.paste(img, ((canvas_side - w) // 2, (canvas_side - h) // 2), img)

    sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icons = [canvas.resize(s, Image.Resampling.LANCZOS) for s in sizes]
    dst.parent.mkdir(parents=True, exist_ok=True)
    icons[0].save(dst, format="ICO", sizes=sizes)

    print(f"Wrote {dst}")


if __name__ == "__main__":
    main()

