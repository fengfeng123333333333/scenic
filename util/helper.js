/**
 * 从微信小程序扫码的 scene 参数中解析 vid
 * scene 格式: "vid%253Dxn8gwefm5ia3zlkvnh"
 * （= 号经过双重 URL 编码：= → %3D → %253D）
 * @param {string} scene - 原始 scene 参数
 * @returns {string|null} 解析出的 vid 值，失败返回 null
 */
export function parseVidFromScene(scene) {
	if (!scene) return null;
	let decoded = scene;
	try {
		decoded = decodeURIComponent(scene);
		decoded = decodeURIComponent(decoded);
	} catch (e) {
		return null;
	}
	const idx = decoded.indexOf("=");
	if (idx > 0 && decoded.substring(0, idx) === "vid") {
		return decoded.substring(idx + 1);
	}
	return null;
}
