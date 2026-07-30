// Change thumbnail image into the big image
function changeImage(thumbnailImage) {
    const page = thumbnailImage.closest(".page");
    const mainImage = page.querySelector(".main-image img");
    const mainImageBox = page.querySelector(".main-image");

    mainImage.src = thumbnailImage.src;

    // Reset zoom when changing image
    if (mainImageBox.resetZoom) {
        mainImageBox.resetZoom();
    }

    page.querySelectorAll(".thumb").forEach((thumb) => {
        thumb.classList.remove("active");
    });

    thumbnailImage.closest(".thumb").classList.add("active");
}


// Add pinch zoom to every big image
document.querySelectorAll(".main-image").forEach((imageBox) => {
    const image = imageBox.querySelector("img");

    let scale = 1;
    let startScale = 1;
    let startDistance = 0;

    let translateX = 0;
    let translateY = 0;

    let panStartX = 0;
    let panStartY = 0;

    const minimumScale = 1;
    const maximumScale = 4;

    function getDistance(touch1, touch2) {
        const xDistance = touch2.clientX - touch1.clientX;
        const yDistance = touch2.clientY - touch1.clientY;

        return Math.hypot(xDistance, yDistance);
    }

    function limitMovement() {
        const maximumX =
            (imageBox.clientWidth * (scale - 1)) / 2;

        const maximumY =
            (imageBox.clientHeight * (scale - 1)) / 2;

        translateX = Math.max(
            -maximumX,
            Math.min(maximumX, translateX)
        );

        translateY = Math.max(
            -maximumY,
            Math.min(maximumY, translateY)
        );
    }

    function updateImage() {
        limitMovement();

        image.style.transform =
            `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
    }

    function resetZoom() {
        scale = 1;
        translateX = 0;
        translateY = 0;

        imageBox.style.touchAction = "pan-x";
        image.style.transition = "transform 0.2s ease";

        updateImage();
    }

    imageBox.resetZoom = resetZoom;

    imageBox.addEventListener(
        "touchstart",
        (event) => {
            image.style.transition = "none";

            // Two-finger pinch
            if (event.touches.length === 2) {
                event.preventDefault();

                startDistance = getDistance(
                    event.touches[0],
                    event.touches[1]
                );

                startScale = scale;
            }

            // One-finger movement when zoomed
            if (event.touches.length === 1 && scale > 1) {
                event.preventDefault();

                panStartX =
                    event.touches[0].clientX - translateX;

                panStartY =
                    event.touches[0].clientY - translateY;
            }
        },
        { passive: false }
    );

    imageBox.addEventListener(
        "touchmove",
        (event) => {
            // Pinch zoom
            if (event.touches.length === 2) {
                event.preventDefault();

                const currentDistance = getDistance(
                    event.touches[0],
                    event.touches[1]
                );

                scale =
                    startScale *
                    (currentDistance / startDistance);

                scale = Math.max(
                    minimumScale,
                    Math.min(maximumScale, scale)
                );

                if (scale > 1) {
                    imageBox.style.touchAction = "none";
                }

                updateImage();
            }

            // Move the zoomed image
            if (event.touches.length === 1 && scale > 1) {
                event.preventDefault();

                translateX =
                    event.touches[0].clientX - panStartX;

                translateY =
                    event.touches[0].clientY - panStartY;

                updateImage();
            }
        },
        { passive: false }
    );

    imageBox.addEventListener("touchend", () => {
        image.style.transition = "transform 0.2s ease";

        if (scale <= 1.05) {
            resetZoom();
        }
    });

    // Double-tap to zoom or reset
    let previousTapTime = 0;

    imageBox.addEventListener("touchend", (event) => {
        if (event.touches.length !== 0) {
            return;
        }

        const currentTime = Date.now();

        if (currentTime - previousTapTime < 300) {
            if (scale > 1) {
                resetZoom();
            } else {
                scale = 2;
                imageBox.style.touchAction = "none";
                updateImage();
            }
        }

        previousTapTime = currentTime;
    });
});


// Keyboard slider support
const slider = document.querySelector(".slider");
const pages = document.querySelectorAll(".page");

document.addEventListener("keydown", (event) => {
    if (
        event.key !== "ArrowRight" &&
        event.key !== "ArrowLeft"
    ) {
        return;
    }

    const pageWidth = slider.clientWidth;
    const currentPage = Math.round(
        slider.scrollLeft / pageWidth
    );

    const direction =
        event.key === "ArrowRight" ? 1 : -1;

    const nextPage = Math.max(
        0,
        Math.min(
            pages.length - 1,
            currentPage + direction
        )
    );

    slider.scrollTo({
        left: nextPage * pageWidth,
        behavior: "smooth"
    });
});
window.addEventListener("load", () => {
    const loader = document.getElementById("pageLoader");

    setTimeout(() => {
        loader.classList.add("hide");

        setTimeout(() => {
            loader.remove();
        }, 400);
    }, 2000);
});