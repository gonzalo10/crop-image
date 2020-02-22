export const addEventListeners = (
	document,
	onDocMouseTouchMove,
	onDocMouseTouchEnd,
	componentRef,
	onMediaLoaded,
	options
) => {
	document.addEventListener('mousemove', onDocMouseTouchMove, options);
	document.addEventListener('touchmove', onDocMouseTouchMove, options);
	document.addEventListener('mouseup', onDocMouseTouchEnd, options);
	document.addEventListener('touchend', onDocMouseTouchEnd, options);
	document.addEventListener('touchcancel', onDocMouseTouchEnd, options);
	componentRef.addEventListener('medialoaded', onMediaLoaded);
};
export const removeEventListeners = (
	document,
	onDocMouseTouchMove,
	onDocMouseTouchEnd,
	componentRef,
	onMediaLoaded
) => {
	document.removeEventListener('mousemove', onDocMouseTouchMove);
	document.removeEventListener('touchmove', onDocMouseTouchMove);
	document.removeEventListener('mouseup', onDocMouseTouchEnd);
	document.removeEventListener('touchend', onDocMouseTouchEnd);
	document.removeEventListener('touchcancel', onDocMouseTouchEnd);
	componentRef.removeEventListener('medialoaded', onMediaLoaded);
};

export function getClientPos(e) {
	let pageX;
	let pageY;

	if (e.touches) {
		[{ pageX, pageY }] = e.touches;
	} else {
		({ pageX, pageY } = e);
	}

	return {
		x: pageX,
		y: pageY,
	};
}

export function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
}

export function isCropValid(crop) {
	return (
		crop &&
		crop.width &&
		crop.height &&
		!isNaN(crop.width) &&
		!isNaN(crop.height)
	);
}

export function inverseOrd(ord) {
	if (ord === 'n') return 's';
	if (ord === 'ne') return 'sw';
	if (ord === 'e') return 'w';
	if (ord === 'se') return 'nw';
	if (ord === 's') return 'n';
	if (ord === 'sw') return 'ne';
	if (ord === 'w') return 'e';
	if (ord === 'nw') return 'se';
	return ord;
}

export function convertToPercentCrop(crop, imageWidth, imageHeight) {
	if (crop.unit === '%') {
		return crop;
	}

	return {
		unit: '%',
		aspect: crop.aspect,
		x: (crop.x / imageWidth) * 100,
		y: (crop.y / imageHeight) * 100,
		width: (crop.width / imageWidth) * 100,
		height: (crop.height / imageHeight) * 100,
	};
}

export function convertToPixelCrop(crop, imageWidth, imageHeight) {
	if (!crop.unit) {
		return { ...crop, unit: 'px' };
	}

	if (crop.unit === 'px') {
		return crop;
	}

	return {
		unit: 'px',
		aspect: crop.aspect,
		x: (crop.x * imageWidth) / 100,
		y: (crop.y * imageHeight) / 100,
		width: (crop.width * imageWidth) / 100,
		height: (crop.height * imageHeight) / 100,
	};
}

export function resolveCrop(pixelCrop, imageWidth, imageHeight) {
	if (!pixelCrop) {
		return pixelCrop;
	}

	let fixedCrop = pixelCrop;
	const widthOverflows = pixelCrop.x + pixelCrop.width > imageWidth;
	const heightOverflows = pixelCrop.y + pixelCrop.height > imageHeight;

	if (widthOverflows && heightOverflows) {
		fixedCrop = {
			unit: 'px',
			x: 0,
			y: 0,
			width: imageWidth > pixelCrop.width ? pixelCrop.width : imageWidth,
			height: imageHeight > pixelCrop.height ? pixelCrop.height : imageHeight,
		};
	} else if (widthOverflows) {
		fixedCrop = {
			...pixelCrop,
			x: 0,
			width: imageWidth > pixelCrop.width ? pixelCrop.width : imageWidth,
		};
	} else if (heightOverflows) {
		fixedCrop = {
			...pixelCrop,
			y: 0,
			height: imageHeight > pixelCrop.height ? pixelCrop.height : imageHeight,
		};
	}

	return fixedCrop;
}

export function containCrop(prevCrop, crop, imageWidth, imageHeight) {
	const pixelCrop = convertToPixelCrop(crop, imageWidth, imageHeight);
	const prevPixelCrop = convertToPixelCrop(prevCrop, imageWidth, imageHeight);
	const contained = { ...pixelCrop };

	// Non-aspects are simple
	if (!pixelCrop.aspect) {
		if (pixelCrop.x < 0) {
			contained.x = 0;
			contained.width += pixelCrop.x;
		} else if (pixelCrop.x + pixelCrop.width > imageWidth) {
			contained.width = imageWidth - pixelCrop.x;
		}

		if (pixelCrop.y + pixelCrop.height > imageHeight) {
			contained.height = imageHeight - pixelCrop.y;
		}

		return contained;
	}

	let adjustedForX = false;

	if (pixelCrop.x < 0) {
		contained.x = 0;
		contained.width += pixelCrop.x;
		contained.height = contained.width / pixelCrop.aspect;
		adjustedForX = true;
	} else if (pixelCrop.x + pixelCrop.width > imageWidth) {
		contained.width = imageWidth - pixelCrop.x;
		contained.height = contained.width / pixelCrop.aspect;
		adjustedForX = true;
	}

	// If sizing in up direction we need to pin Y at the point it
	// would be at the boundary.
	if (adjustedForX && prevPixelCrop.y > contained.y) {
		contained.y = pixelCrop.y + (pixelCrop.height - contained.height);
	}

	let adjustedForY = false;

	if (contained.y + contained.height > imageHeight) {
		contained.height = imageHeight - pixelCrop.y;
		contained.width = contained.height * pixelCrop.aspect;
		adjustedForY = true;
	}

	// If sizing in left direction we need to pin X at the point it
	// would be at the boundary.
	if (adjustedForY && prevPixelCrop.x > contained.x) {
		contained.x = pixelCrop.x + (pixelCrop.width - contained.width);
	}

	return contained;
}
