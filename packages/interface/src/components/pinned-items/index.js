/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import ActionItem from '../action-item';

function PinnedItems( { scope, ...props } ) {
	return <ActionItem name={ `PinnedItems/${ scope }` } { ...props } />;
}

function PinnedItemsSlot( { scope, className, ...props } ) {
	return (
		<ActionItem.Slot
			name={ `PinnedItems/${ scope }` }
			className={ classnames( className, 'interface-pinned-items' ) }
			{ ...props }
		/>
	);
}

PinnedItems.Slot = PinnedItemsSlot;

export default PinnedItems;
