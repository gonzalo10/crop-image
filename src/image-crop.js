import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { CropWrapper, CropImageWrapper } from './styles';
import {
	getClientPos,
	clamp,
	isCropValid,
	convertToPercentCrop,
	convertToPixelCrop,
	containCrop,
	addEventListeners,
	removeEventListeners,
	crossOverCheck,
	straightenYPath,
} from './utils';
import { CreateCropSelection } from './crop-selection';

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
				this.onDocMouseEnd,
				options
			);
		}
	}

	componentWillUnmount() {
		if (this.document.removeEventListener)
			removeEventListeners(
				this.document,
				this.onDocMouseMove,
				this.onDocMouseEnd
			);
	}

	handleChangeSelection = evData => {
		this.evData = evData;
		this.mouseDownOnCropArea = true;
		this.setState({ cropIsActive: true });
	};

	onComponentMouseDown = e => {
		const { crop, disabled, locked, keepSelection, onChange } = this.props;

		// firstChild to get the wrapping div and not the image
		const componentEl = this.mediaWrapperRef.firstChild;

		if (e.target !== componentEl || !componentEl.contains(e.target)) return;
		if (disabled || locked || (keepSelection && isCropValid(crop))) return;

		e.preventDefault(); // Stop drag selection.

		const clientPos = getClientPos(e);

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
			clientPos.y = straightenYPath(clientPos.x, this.evData);
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

	onDocMouseEnd = e => {
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

		// Allows to invert the selected area
		if (evData.yCrossOver) {
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
		this.evData = crossOverCheck(this.evData, this.props);

		return nextCrop;
	}

	makeNewCrop(unit = 'px') {
		const crop = { ...ReactCrop.defaultCrop, ...this.props.crop };
		const { width, height } = this.mediaDimensions;

		return unit === 'px'
			? convertToPixelCrop(crop, width, height)
			: convertToPercentCrop(crop, width, height);
	}

	render() {
		const {
			children,
			crossorigin,
			crop,
			imageAlt,
			onImageError,
			renderComponent,
			src,
			style,
			imageStyle,
			onImageLoaded,
		} = this.props;

		return (
			<CropWrapper
				ref={n => (this.componentRef = n)}
				className={'ReactCrop'}
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
							onLoad={onImageLoaded}
							onError={onImageError}
							alt={imageAlt}
						/>
					)}
				</div>
				{children}
				{isCropValid(crop) && (
					<CreateCropSelection
						props={this.props}
						getCropStyle={() => this.getCropStyle()}
						onCropAreaMouseDown={this.onCropAreaMouseDown}
						handleChangeSelection={this.handleChangeSelection}
						getElementOffset={this.getElementOffset}
						mediaDimensions={this.mediaDimensions}
						mouseDownOnCropArea={this.mouseDownOnCropArea}
					/>
				)}
			</CropWrapper>
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
