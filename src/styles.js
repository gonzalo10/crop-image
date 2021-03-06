import styled from 'styled-components';

const Handler = styled.div`
	position: absolute;
	width: 10px;
	height: 10px;
	background-color: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.7);
	box-sizing: border-box;
	outline: 1px solid transparent;
`;

export const NorthPoint = styled(Handler)`
	top: 0;
	left: 50%;
	margin-top: -5px;
	margin-left: -5px;
	cursor: n-resize;
`;
export const NorthWestPoint = styled(Handler)`
	top: 0;
	left: 0;
	margin-top: -5px;
	margin-left: -5px;
	cursor: nw-resize;
`;
export const NorthEastPoint = styled(Handler)`
	top: 0;
	right: 0;
	margin-top: -5px;
	margin-right: -5px;
	cursor: ne-resize;
`;
export const EastPoint = styled(Handler)`
	top: 50%;
	right: 0;
	margin-top: -5px;
	margin-right: -5px;
	cursor: e-resize;
`;
export const SouthEastPoint = styled(Handler)`
	bottom: 0;
	right: 0;
	margin-bottom: -5px;
	margin-right: -5px;
	cursor: se-resize;
`;
export const SouthPoint = styled(Handler)`
	bottom: 0;
	left: 50%;
	margin-bottom: -5px;
	margin-left: -5px;
	cursor: s-resize;
`;
export const SouthWestPoint = styled(Handler)`
	bottom: 0;
	left: 0;
	margin-bottom: -5px;
	margin-left: -5px;
	cursor: sw-resize;
`;
export const WestPoint = styled(Handler)`
	top: 50%;
	left: 0;
	margin-top: -5px;
	margin-left: -5px;
	cursor: w-resize;
`;

export const CropSelectionWrapper = styled.div`
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
`;

export const CropWrapper = styled.div`
	position: relative;
	cursor: crosshair;
	overflow: hidden;
	max-width: 100%;
	display: block;
	touch-action: manipulation;
`;

export const CropImageWrapper = styled.img`
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

const DragBar = styled.div`
	position: absolute;
`;
export const DragBarOrdN = styled(DragBar)`
	top: 0;
	left: 0;
	width: 100%;
	height: 6px;
	margin-top: -3px;
`;
export const DragBarOrdE = styled(DragBar)`
	right: 0;
	top: 0;
	width: 6px;
	height: 100%;
	margin-right: -3px;
`;
export const DragBarOrdS = styled(DragBar)`
	bottom: 0;
	left: 0;
	width: 100%;
	height: 6px;
	margin-bottom: -3px;
`;
export const DragBarOrdW = styled(DragBar)`
	top: 0;
	left: 0;
	width: 6px;
	height: 100%;
	margin-left: -3px;
`;
