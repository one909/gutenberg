/**
 * External dependencies
 */
import classnames from 'classnames';
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { Animate, Button, Panel, Slot, Fill } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { withPluginContext } from '@wordpress/plugins';
import { check, starEmpty, starFilled } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import ComplementaryAreaHeader from '../complementary-area-header';
import PinnedItems from '../pinned-items';
import ActionItem from '../action-item';

function ComplementaryAreaSlot( { scope, ...props } ) {
	return <Slot name={ `ComplementaryArea/${ scope }` } { ...props } />;
}

function ComplementaryAreaFill( { scope, children, className } ) {
	return (
		<Fill name={ `ComplementaryArea/${ scope }` }>
			<Animate type="slide-in" options={ { origin: 'left' } }>
				{ () => <div className={ className }>{ children }</div> }
			</Animate>
		</Fill>
	);
}

const complementaryAreaContext = withPluginContext( ( context, ownProps ) => {
	return {
		icon: ownProps.icon || context.icon,
		complementaryAreaIdentifier:
			ownProps.complementaryAreaIdentifier ||
			`${ context.name }/${ ownProps.name }`,
	};
} );

export function ComplementaryAreaToggleInner( {
	as = Button,
	scope,
	complementaryAreaIdentifier,
	icon,
	selectedIcon,
	...props
} ) {
	const ComponentToUse = as;
	const isSelected = useSelect(
		( select ) =>
			select( 'core/interface' ).getActiveComplementaryArea( scope ) ===
			complementaryAreaIdentifier,
		[ complementaryAreaIdentifier ]
	);
	const { enableComplementaryArea, disableComplementaryArea } = useDispatch(
		'core/interface'
	);
	return (
		<ComponentToUse
			icon={ selectedIcon && isSelected ? selectedIcon : icon }
			isSelected={ isSelected }
			onClick={ () => {
				if ( isSelected ) {
					disableComplementaryArea( scope );
				} else {
					enableComplementaryArea(
						scope,
						complementaryAreaIdentifier
					);
				}
			} }
			{ ...omit( props, [ 'name' ] ) }
		/>
	);
}

export const ComplementaryAreaToggle = complementaryAreaContext(
	ComplementaryAreaToggleInner
);
function ComplementaryAreaMoreMenuItem( { scope, target, ...props } ) {
	return (
		<ComplementaryAreaToggle
			as={ ( toggleProps ) => {
				return (
					<ActionItem
						name={ `${ scope }/plugin-more-menu` }
						{ ...toggleProps }
					/>
				);
			} }
			role="menuitemcheckbox"
			selectedIcon={ check }
			name={ target }
			scope={ scope }
			{ ...props }
		/>
	);
}

function ComplementaryArea( {
	children,
	className,
	closeLabel = __( 'Close plugin' ),
	complementaryAreaIdentifier,
	header,
	headerClassName,
	icon,
	isPinnable = true,
	panelClassName,
	scope,
	smallScreenTitle,
	title,
	toggleShortcut,
} ) {
	const { isActive, isPinned } = useSelect(
		( select ) => {
			const { getActiveComplementaryArea, isItemPinned } = select(
				'core/interface'
			);
			return {
				isActive:
					getActiveComplementaryArea( scope ) ===
					complementaryAreaIdentifier,
				isPinned: isItemPinned( scope, complementaryAreaIdentifier ),
			};
		},
		[ complementaryAreaIdentifier, scope ]
	);
	const { pinItem, unpinItem } = useDispatch( 'core/interface' );
	return (
		<>
			{ isPinned && (
				<ComplementaryAreaToggle
					scope={ scope }
					complementaryAreaIdentifier={ complementaryAreaIdentifier }
					as={ ( props ) => {
						return <PinnedItems { ...props } scope={ scope } />;
					} }
					isPressed={ isActive }
					aria-expanded={ isActive }
					label={ title }
					icon={ icon }
				/>
			) }
			{ isActive && (
				<ComplementaryAreaFill
					className={ classnames(
						'interface-complementary-area',
						className
					) }
					scope={ scope }
				>
					<ComplementaryAreaHeader
						className={ headerClassName }
						closeLabel={ closeLabel }
						smallScreenTitle={ smallScreenTitle }
						toggleButtonProps={ {
							label: closeLabel,
							shortcut: toggleShortcut,
							scope,
							complementaryAreaIdentifier,
						} }
					>
						{ header || (
							<>
								<strong>{ title }</strong>
								{ isPinnable && (
									<Button
										className="interface-complementary-area__pin-unpin-item"
										icon={
											isPinned ? starFilled : starEmpty
										}
										label={
											isPinned
												? __( 'Unpin from toolbar' )
												: __( 'Pin to toolbar' )
										}
										onClick={ () =>
											( isPinned ? unpinItem : pinItem )(
												scope,
												complementaryAreaIdentifier
											)
										}
										isPressed={ isPinned }
										aria-expanded={ isPinned }
									/>
								) }
							</>
						) }
					</ComplementaryAreaHeader>
					<Panel className={ panelClassName }>{ children }</Panel>
				</ComplementaryAreaFill>
			) }
		</>
	);
}

const ComplementaryAreaWrapped = complementaryAreaContext( ComplementaryArea );

ComplementaryAreaWrapped.Slot = ComplementaryAreaSlot;
ComplementaryAreaWrapped.Toggle = ComplementaryAreaToggle;
ComplementaryAreaWrapped.MoreMenuItem = ComplementaryAreaMoreMenuItem;

export default ComplementaryAreaWrapped;
