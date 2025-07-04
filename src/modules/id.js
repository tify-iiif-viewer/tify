export function getUniqueId(prefix, instanceId, postfix) {
	return (prefix ? `${prefix}-` : '')
		+ (instanceId || Math.random().toString(36).substring(2))
		+ (postfix ? `-${postfix}` : '');
}
