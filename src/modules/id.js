const id = `tify-${Math.floor(Math.random() * Date.now())}`;

export function getId(postfix) {
	return id + (postfix ? `-${postfix}` : '');
}
