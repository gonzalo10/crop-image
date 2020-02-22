import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styled from 'styled-components';

import {
	getClientPos,
	clamp,
	isCropValid,
	inverseOrd,
	convertToPercentCrop,
	convertToPixelCrop,
	resolveCrop,
	containCrop,
	addEventListeners,
	removeEventListeners,
} from './utils';

const CropSelectionWrapper = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	transform: translate3d(0, 0, 0);
	box-sizing: border-box;
	cursor: move;
	box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.5);
	touch-action: manipulation;
	border: 1px solid;
	border-image-source: url('data:image/gif;base64,R0lGODlhCgAKAJECAAAAAP///////wAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEI5RDc5MTFDNkE2MTFFM0JCMDZEODI2QTI4MzJBOTIiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEI5RDc5MTBDNkE2MTFFM0JCMDZEODI2QTI4MzJBOTIiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuZGlkOjAyODAxMTc0MDcyMDY4MTE4MDgzQzNDMjA5MzREQ0ZDIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAyODAxMTc0MDcyMDY4MTE4MDgzQzNDMjA5MzREQ0ZDIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEBQoAAgAsAAAAAAoACgAAAhWEERkn7W3ei7KlagMWF/dKgYeyGAUAIfkEBQoAAgAsAAAAAAoACgAAAg+UYwLJ7RnQm7QmsCyVKhUAIfkEBQoAAgAsAAAAAAoACgAAAhCUYgLJHdiinNSAVfOEKoUCACH5BAUKAAIALAAAAAAKAAoAAAIRVISAdusPo3RAzYtjaMIaUQAAIfkEBQoAAgAsAAAAAAoACgAAAg+MDiem7Q8bSLFaG5il6xQAIfkEBQoAAgAsAAAAAAoACgAAAg+UYRLJ7QnQm7SmsCyVKhUAIfkEBQoAAgAsAAAAAAoACgAAAhCUYBLJDdiinNSEVfOEKoECACH5BAUKAAIALAAAAAAKAAoAAAIRFISBdusPo3RBzYsjaMIaUQAAOw==');
	border-image-slice: 1;
	border-image-repeat: repeat;
	${props =>
		props.circularCrop &&
		`border-radius: 50%;
	box-shadow: 0px 0px 1px 1px white, 0 0 0 9999em rgba(0, 0, 0, 0.5);`}
`;

const CropImageWrapper = styled.img`
	position: relative;
	display: inline-block;
	cursor: crosshair;
	overflow: hidden;
	max-width: 100%;
	&:focus {
		outline: none;
	}
	display: block;
	max-width: 100%;
	touch-action: manipulation;
`;

let passiveSupported = false;

try {
	window.addEventListener(
		'test',
		null,
		Object.defineProperty({}, 'passive', {
			get: () => {
				passiveSupported = true;
				return true;
			},
		})
	);
} catch (err) {} // eslint-disable-line no-empty

class ReactCrop extends PureComponent {
	window = typeof window !== 'undefined' ? window : {};

	document = typeof document !== 'undefined' ? document : {};

	state = {};

	componentDidMount() {
		if (this.document.addEventListener) {
			const options = passiveSupported ? { passive: false } : false;
			addEventListeners(
				this.document,
				this.onDocMouseMove,
				this.onDocMouseTouchEnd,
				this.componentRef,
				this.onMediaLoaded,
				options
			);
		}
	}

	componentWillUnmount() {
		if (this.document.removeEventListener)
			removeEventListeners(
				this.document,
				this.onDocMouseMove,
				this.onDocMouseTouchEnd,
				this.componentRef,
				this.onMediaLoaded
			);
	}

	componentDidUpdate(prevProps) {
		//Dont know what this does
		// const { onChange, onComplete, crop } = this.props;
		// if (prevProps.crop !== crop && this.imageRef) {
		// 	const { width, height } = this.imageRef;
		// 	const crop = this.makeNewCrop();
		// 	const resolvedCrop = resolveCrop(crop, width, height);
		// 	if (crop !== resolvedCrop) {
		// 		console.log('corp!==resolvedCrop');
		// 		const pixelCrop = convertToPixelCrop(resolvedCrop, width, height);
		// 		const percentCrop = convertToPercentCrop(resolvedCrop, width, height);
		// 		onChange(pixelCrop, percentCrop);
		// 		onComplete(pixelCrop, percentCrop);
		// 	}
		// }
	}

	onCropAreaMouseDown = e => {
		// console.log('onCropAreaMouseDown');
		const { crop, disabled } = this.props;
		const { width, height } = this.mediaDimensions;
		const pixelCrop = convertToPixelCrop(crop, width, height);

		if (disabled) {
			return;
		}
		e.preventDefault(); // Stop drag selection.

		const clientPos = getClientPos(e);

		// Focus for detecting keypress.
		this.componentRef.focus({ preventScroll: true });
		const { ord } = e.target.dataset;
		const xInversed = ord === 'nw' || ord === 'w' || ord === 'sw';
		const yInversed = ord === 'nw' || ord === 'n' || ord === 'ne';

		let cropOffset;

		if (pixelCrop.aspect) {
			cropOffset = this.getElementOffset(this.cropSelectRef);
		}

		this.evData = {
			clientStartX: clientPos.x,
			clientStartY: clientPos.y,
			cropStartWidth: pixelCrop.width,
			cropStartHeight: pixelCrop.height,
			cropStartX: xInversed ? pixelCrop.x + pixelCrop.width : pixelCrop.x,
			cropStartY: yInversed ? pixelCrop.y + pixelCrop.height : pixelCrop.y,
			xInversed,
			yInversed,
			xCrossOver: xInversed,
			yCrossOver: yInversed,
			startXCrossOver: xInversed,
			startYCrossOver: yInversed,
			isResize: e.target.dataset.ord,
			ord,
			cropOffset,
		};

		this.mouseDownOnCropArea = true;
		this.setState({ cropIsActive: true });
	};

	onComponentMouseDown = e => {
		console.log('onComponentMouseDown');
		const { crop, disabled, locked, keepSelection, onChange } = this.props;

		// firstChild to get the wrapping div and not the image
		const componentEl = this.mediaWrapperRef.firstChild;

		if (e.target !== componentEl || !componentEl.contains(e.target)) return;
		if (disabled || locked || (keepSelection && isCropValid(crop))) return;

		e.preventDefault(); // Stop drag selection.

		const clientPos = getClientPos(e);

		// Focus for detecting keypress.
		this.componentRef.focus({ preventScroll: true });

		const mediaOffset = this.getElementOffset(this.mediaWrapperRef);
		const mouseXPosInImage = clientPos.x - mediaOffset.left;
		const mouseYPosInImage = clientPos.y - mediaOffset.top;

		const nextCrop = {
			unit: 'px',
			aspect: crop ? crop.aspect : undefined,
			x: mouseXPosInImage,
			y: mouseYPosInImage,
			width: 0,
			height: 0,
		};

		this.evData = {
			clientStartX: clientPos.x,
			clientStartY: clientPos.y,
			cropStartWidth: nextCrop.width,
			cropStartHeight: nextCrop.height,
			cropStartX: nextCrop.x,
			cropStartY: nextCrop.y,
			xInversed: false,
			yInversed: false,
			xCrossOver: false,
			yCrossOver: false,
			startXCrossOver: false,
			startYCrossOver: false,
			isResize: true,
			ord: 'nw',
		};

		this.mouseDownOnCropArea = true;

		const { width, height } = this.mediaDimensions;

		onChange(
			convertToPixelCrop(nextCrop, width, height),
			convertToPercentCrop(nextCrop, width, height)
		);

		this.setState({ cropIsActive: true, newCropIsBeingDrawn: true });
	};

	onDocMouseMove = e => {
		console.log('onDocMouseMove');
		const { crop, disabled, onChange, onDragStart } = this.props;

		if (disabled) return;

		if (!this.mouseDownOnCropArea) return;

		e.preventDefault(); // Stop drag selection.

		if (!this.dragStarted) {
			this.dragStarted = true;
			onDragStart(e);
		}

		const { evData } = this;
		const clientPos = getClientPos(e);

		if (evData.isResize && crop.aspect && evData.cropOffset) {
			clientPos.y = this.straightenYPath(clientPos.x);
		}
		evData.xDiff = clientPos.x - evData.clientStartX;
		evData.yDiff = clientPos.y - evData.clientStartY;

		let nextCrop;

		if (evData.isResize) nextCrop = this.resizeCrop();
		else nextCrop = this.dragCrop();

		if (nextCrop !== crop) {
			const { width, height } = this.mediaDimensions;
			onChange(
				convertToPixelCrop(nextCrop, width, height),
				convertToPercentCrop(nextCrop, width, height)
			);
		}
	};

	onDocMouseTouchEnd = e => {
		const { crop, disabled, onComplete, onDragEnd } = this.props;

		if (disabled) {
			return;
		}

		if (this.mouseDownOnCropArea) {
			this.mouseDownOnCropArea = false;
			this.dragStarted = false;

			const { width, height } = this.mediaDimensions;

			onDragEnd(e);
			onComplete(
				convertToPixelCrop(crop, width, height),
				convertToPercentCrop(crop, width, height)
			);

			this.setState({ cropIsActive: false, newCropIsBeingDrawn: false });
		}
	};

	// When the image is loaded or when a custom component via `renderComponent` prop fires
	// a custom "medialoaded" event.
	createNewCrop() {
		const { width, height } = this.mediaDimensions;
		const crop = this.makeNewCrop();
		const resolvedCrop = resolveCrop(crop, width, height);
		const pixelCrop = convertToPixelCrop(resolvedCrop, width, height);
		const percentCrop = convertToPercentCrop(resolvedCrop, width, height);
		return { pixelCrop, percentCrop };
	}

	// Custom components (using `renderComponent`) should fire a custom event
	// called "medialoaded" when they are loaded.
	onMediaLoaded = () => {
		const { onComplete, onChange } = this.props;
		const { pixelCrop, percentCrop } = this.createNewCrop();
		onChange(pixelCrop, percentCrop);
		onComplete(pixelCrop, percentCrop);
	};

	// this is to create a cropArea as soon as so load the image
	onImageLoad(image) {
		const { onComplete, onChange, onImageLoaded } = this.props;

		// Return false from onImageLoaded if you set the crop with setState in there as otherwise
		// the subsequent onChange + onComplete will not have your updated crop.
		const res = onImageLoaded(image);

		if (res !== false) {
			const { pixelCrop, percentCrop } = this.createNewCrop();
			onChange(pixelCrop, percentCrop);
			onComplete(pixelCrop, percentCrop);
		}
	}

	get mediaDimensions() {
		const { clientWidth, clientHeight } = this.mediaWrapperRef;
		return { width: clientWidth, height: clientHeight };
	}

	getDocumentOffset() {
		const { clientTop = 0, clientLeft = 0 } =
			this.document.documentElement || {};
		return { clientTop, clientLeft };
	}

	getWindowOffset() {
		const { pageYOffset = 0, pageXOffset = 0 } = this.window;
		return { pageYOffset, pageXOffset };
	}

	getElementOffset(el) {
		const rect = el.getBoundingClientRect();
		const doc = this.getDocumentOffset();
		const win = this.getWindowOffset();

		const top = rect.top + win.pageYOffset - doc.clientTop;
		const left = rect.left + win.pageXOffset - doc.clientLeft;

		return { top, left };
	}

	getCropStyle() {
		const crop = this.makeNewCrop(
			this.props.crop ? this.props.crop.unit : 'px'
		);

		return {
			top: `${crop.y}${crop.unit}`,
			left: `${crop.x}${crop.unit}`,
			width: `${crop.width}${crop.unit}`,
			height: `${crop.height}${crop.unit}`,
		};
	}

	getNewSize() {
		const { crop, minWidth, maxWidth, minHeight, maxHeight } = this.props;
		const { evData } = this;
		const { width, height } = this.mediaDimensions;

		// New width.
		let newWidth = evData.cropStartWidth + evData.xDiff;

		if (evData.xCrossOver) {
			newWidth = Math.abs(newWidth);
		}

		newWidth = clamp(newWidth, minWidth, maxWidth || width);

		// New height.
		let newHeight;

		if (crop.aspect) {
			newHeight = newWidth / crop.aspect;
		} else {
			newHeight = evData.cropStartHeight + evData.yDiff;
		}

		if (evData.yCrossOver) {
			// Cap if polarity is inversed and the height fills the y space.
			newHeight = Math.min(Math.abs(newHeight), evData.cropStartY);
		}

		newHeight = clamp(newHeight, minHeight, maxHeight || height);

		if (crop.aspect) {
			newWidth = clamp(newHeight * crop.aspect, 0, width);
		}

		return {
			width: newWidth,
			height: newHeight,
		};
	}

	dragCrop() {
		const nextCrop = this.makeNewCrop();
		const { evData } = this;
		const { width, height } = this.mediaDimensions;

		nextCrop.x = clamp(
			evData.cropStartX + evData.xDiff,
			0,
			width - nextCrop.width
		);
		nextCrop.y = clamp(
			evData.cropStartY + evData.yDiff,
			0,
			height - nextCrop.height
		);

		return nextCrop;
	}

	resizeCrop() {
		const { evData } = this;
		const nextCrop = this.makeNewCrop();
		const { ord } = evData;

		// On the inverse change the diff so it's the same and
		// the same algo applies.
		if (evData.xInversed) {
			evData.xDiff -= evData.cropStartWidth * 2;
			evData.xDiffPc -= evData.cropStartWidth * 2;
		}
		if (evData.yInversed) {
			evData.yDiff -= evData.cropStartHeight * 2;
			evData.yDiffPc -= evData.cropStartHeight * 2;
		}

		// New size.
		const newSize = this.getNewSize();

		// Adjust x/y to give illusion of 'staticness' as width/height is increased
		// when polarity is inversed.
		let newX = evData.cropStartX;
		let newY = evData.cropStartY;

		if (evData.xCrossOver) {
			newX = nextCrop.x + (nextCrop.width - newSize.width);
		}

		if (evData.yCrossOver) {
			// This not only removes the little "shake" when inverting at a diagonal, but for some
			// reason y was way off at fast speeds moving sw->ne with fixed aspect only, I couldn't
			// figure out why.
			if (evData.lastYCrossover === false) {
				newY = nextCrop.y - newSize.height;
			} else {
				newY = nextCrop.y + (nextCrop.height - newSize.height);
			}
		}

		const { width, height } = this.mediaDimensions;
		const containedCrop = containCrop(
			this.props.crop,
			{
				unit: nextCrop.unit,
				x: newX,
				y: newY,
				width: newSize.width,
				height: newSize.height,
				aspect: nextCrop.aspect,
			},
			width,
			height
		);

		// Apply x/y/width/height changes depending on ordinate (fixed aspect always applies both).
		if (nextCrop.aspect || ReactCrop.xyOrds.indexOf(ord) > -1) {
			nextCrop.x = containedCrop.x;
			nextCrop.y = containedCrop.y;
			nextCrop.width = containedCrop.width;
			nextCrop.height = containedCrop.height;
		} else if (ReactCrop.xOrds.indexOf(ord) > -1) {
			nextCrop.x = containedCrop.x;
			nextCrop.width = containedCrop.width;
		} else if (ReactCrop.yOrds.indexOf(ord) > -1) {
			nextCrop.y = containedCrop.y;
			nextCrop.height = containedCrop.height;
		}

		evData.lastYCrossover = evData.yCrossOver;
		this.crossOverCheck();

		return nextCrop;
	}

	straightenYPath(clientX) {
		const { evData } = this;
		const { ord } = evData;
		const { cropOffset, cropStartWidth, cropStartHeight } = evData;
		let k;
		let d;

		if (ord === 'nw' || ord === 'se') {
			k = cropStartHeight / cropStartWidth;
			d = cropOffset.top - cropOffset.left * k;
		} else {
			k = -cropStartHeight / cropStartWidth;
			d = cropOffset.top + (cropStartHeight - cropOffset.left * k);
		}

		return k * clientX + d;
	}

	createCropSelection() {
		const { disabled, locked, ruleOfThirds } = this.props;
		const style = this.getCropStyle();

		return (
			<CropSelectionWrapper
				ref={r => (this.cropSelectRef = r)}
				style={style}
				onMouseDown={this.onCropAreaMouseDown}
				onTouchStart={this.onCropAreaMouseDown}
				tabIndex='0'>
				{!disabled && !locked && (
					<div>
						<div className='ReactCrop__drag-bar ord-n' data-ord='n' />
						<div className='ReactCrop__drag-bar ord-e' data-ord='e' />
						<div className='ReactCrop__drag-bar ord-s' data-ord='s' />
						<div className='ReactCrop__drag-bar ord-w' data-ord='w' />

						<div className='ReactCrop__drag-handle ord-nw' data-ord='nw' />
						<div className='ReactCrop__drag-handle ord-n' data-ord='n' />
						<div className='ReactCrop__drag-handle ord-ne' data-ord='ne' />
						<div className='ReactCrop__drag-handle ord-e' data-ord='e' />
						<div className='ReactCrop__drag-handle ord-se' data-ord='se' />
						<div className='ReactCrop__drag-handle ord-s' data-ord='s' />
						<div className='ReactCrop__drag-handle ord-sw' data-ord='sw' />
						<div className='ReactCrop__drag-handle ord-w' data-ord='w' />
					</div>
				)}
				{ruleOfThirds && (
					<React.Fragment>
						<div className='ReactCrop__rule-of-thirds-hz' />
						<div className='ReactCrop__rule-of-thirds-vt' />
					</React.Fragment>
				)}
			</CropSelectionWrapper>
		);
	}

	makeNewCrop(unit = 'px') {
		const crop = { ...ReactCrop.defaultCrop, ...this.props.crop };
		const { width, height } = this.mediaDimensions;

		return unit === 'px'
			? convertToPixelCrop(crop, width, height)
			: convertToPercentCrop(crop, width, height);
	}

	crossOverCheck() {
		const { evData } = this;
		const { minWidth, minHeight } = this.props;

		if (
			!minWidth &&
			((!evData.xCrossOver &&
				-Math.abs(evData.cropStartWidth) - evData.xDiff >= 0) ||
				(evData.xCrossOver &&
					-Math.abs(evData.cropStartWidth) - evData.xDiff <= 0))
		) {
			evData.xCrossOver = !evData.xCrossOver;
		}

		if (
			!minHeight &&
			((!evData.yCrossOver &&
				-Math.abs(evData.cropStartHeight) - evData.yDiff >= 0) ||
				(evData.yCrossOver &&
					-Math.abs(evData.cropStartHeight) - evData.yDiff <= 0))
		) {
			evData.yCrossOver = !evData.yCrossOver;
		}

		const swapXOrd = evData.xCrossOver !== evData.startXCrossOver;
		const swapYOrd = evData.yCrossOver !== evData.startYCrossOver;

		evData.inversedXOrd = swapXOrd ? inverseOrd(evData.ord) : false;
		evData.inversedYOrd = swapYOrd ? inverseOrd(evData.ord) : false;
	}

	render() {
		const {
			children,
			className,
			crossorigin,
			crop,
			disabled,
			locked,
			imageAlt,
			onImageError,
			renderComponent,
			src,
			style,
			imageStyle,
			ruleOfThirds,
		} = this.props;

		const { cropIsActive, newCropIsBeingDrawn } = this.state;

		const cropSelection =
			isCropValid(crop) && this.componentRef
				? this.createCropSelection()
				: null;

		const componentClasses = clsx('ReactCrop', className, {
			'ReactCrop--active': cropIsActive,
			'ReactCrop--disabled': disabled,
			'ReactCrop--locked': locked,
			'ReactCrop--new-crop': newCropIsBeingDrawn,
			// In this case we have to shadow the image, since the box-shadow on the crop won't work.
			'ReactCrop--crop-invisible':
				crop && cropIsActive && (!crop.width || !crop.height),
			'ReactCrop--rule-of-thirds': crop && ruleOfThirds,
		});

		return (
			<div
				ref={n => {
					this.componentRef = n;
				}}
				className={componentClasses}
				style={style}
				onMouseDown={this.onComponentMouseDown}
				tabIndex='0'>
				<div ref={n => (this.mediaWrapperRef = n)}>
					{renderComponent || (
						<CropImageWrapper
							ref={r => (this.imageRef = r)}
							crossOrigin={crossorigin}
							style={imageStyle}
							src={src}
							onLoad={e => this.onImageLoad(e.target)}
							onError={onImageError}
							alt={imageAlt}
						/>
					)}
				</div>
				{children}
				{cropSelection}
			</div>
		);
	}
}

ReactCrop.xOrds = ['e', 'w'];
ReactCrop.yOrds = ['n', 's'];
ReactCrop.xyOrds = ['nw', 'ne', 'se', 'sw'];

ReactCrop.nudgeStep = 0.2;
ReactCrop.nudgeStepLarge = 2;

ReactCrop.defaultCrop = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	unit: 'px',
};

ReactCrop.propTypes = {
	className: PropTypes.string,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]),
	circularCrop: PropTypes.bool,
	crop: PropTypes.shape({
		aspect: PropTypes.number,
		x: PropTypes.number,
		y: PropTypes.number,
		width: PropTypes.number,
		height: PropTypes.number,
		unit: PropTypes.oneOf(['px', '%']),
	}),
	crossorigin: PropTypes.string,
	disabled: PropTypes.bool,
	locked: PropTypes.bool,
	imageAlt: PropTypes.string,
	imageStyle: PropTypes.shape({}),
	keepSelection: PropTypes.bool,
	minWidth: PropTypes.number,
	minHeight: PropTypes.number,
	maxWidth: PropTypes.number,
	maxHeight: PropTypes.number,
	onChange: PropTypes.func.isRequired,
	onImageError: PropTypes.func,
	onComplete: PropTypes.func,
	onImageLoaded: PropTypes.func,
	onDragStart: PropTypes.func,
	onDragEnd: PropTypes.func,
	src: PropTypes.string.isRequired,
	style: PropTypes.shape({}),
	renderComponent: PropTypes.node,
	renderSelectionAddon: PropTypes.func,
	ruleOfThirds: PropTypes.bool,
};

ReactCrop.defaultProps = {
	circularCrop: false,
	className: undefined,
	crop: undefined,
	crossorigin: undefined,
	disabled: false,
	locked: false,
	imageAlt: '',
	maxWidth: undefined,
	maxHeight: undefined,
	minWidth: 0,
	minHeight: 0,
	keepSelection: false,
	onComplete: () => {},
	onImageError: () => {},
	onImageLoaded: () => {},
	onDragStart: () => {},
	onDragEnd: () => {},
	children: undefined,
	style: undefined,
	renderComponent: undefined,
	imageStyle: undefined,
	renderSelectionAddon: undefined,
	ruleOfThirds: false,
};

export { ReactCrop as default, ReactCrop as Component, containCrop };
