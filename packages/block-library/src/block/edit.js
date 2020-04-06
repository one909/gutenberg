/**
 * External dependencies
 */
import { partial } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	BlockEditorProvider,
	BlockList,
	WritingFlow,
} from '@wordpress/block-editor';
import { serialize } from '@wordpress/blocks';
import { Placeholder, Spinner, Disabled } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ReusableBlockEditPanel from './edit-panel';
import usePrevious from './use-previous';

export default function ReusableBlockEdit( { attributes, isSelected } ) {
	const { ref } = attributes;

	const {
		theReusableBlock,
		isFetching,
		isSaving,
		isTemporary,
		blocks,
		canUpdateBlock,
		settings,
		title,
	} = useSelect(
		/**
		 * @typedef {Object} WPReusableBlockEditSelectedData
		 *
		 * @property {?Array}  blocks           Reusable block content parsed as blocks.
		 * @property {boolean} canUpdateBlock   Can the current user edit reusable blocks.
		 * @property {boolean} isFetching       Is the reusable block being fetched.
		 * @property {boolean} isSaving         Is the reusable block being saved.
		 * @property {boolean} isTemporary      Is the reusable block temporary.
		 * @property {Object}  settings         Editor settings.
		 * @property {?Object} theReusableBlock The reusable block.
		 * @property {?string} title            The reusable block title.
		 */

		/**
		 * @param {Function} select
		 *
		 * @return {WPReusableBlockEditSelectedData} The data we selected.
		 */
		( select ) => {
			const { canUser } = select( 'core' );
			const {
				__experimentalGetParsedReusableBlock,
				getSettings,
			} = select( 'core/block-editor' );
			const {
				__experimentalGetReusableBlock: getReusableBlock,
				__experimentalIsFetchingReusableBlock: isFetchingReusableBlock,
				__experimentalIsSavingReusableBlock: isSavingReusableBlock,
			} = select( 'core/editor' );
			const reusableBlock = getReusableBlock( ref );

			return {
				theReusableBlock: reusableBlock,
				isFetching: isFetchingReusableBlock( ref ),
				isSaving: isSavingReusableBlock( ref ),
				isTemporary: reusableBlock?.isTemporary ?? null,
				blocks: reusableBlock
					? __experimentalGetParsedReusableBlock( ref )
					: null,
				canUpdateBlock:
					!! reusableBlock &&
					! reusableBlock.isTemporary &&
					!! canUser( 'update', 'blocks', ref ),
				settings: getSettings(),
				title: reusableBlock?.title ?? null,
			};
		},
		[ ref ]
	);

	const {
		__experimentalFetchReusableBlocks: fetchReusableBlocks,
		__experimentalUpdateReusableBlock: updateReusableBlock,
		__experimentalSaveReusableBlock: saveReusableBlock,
	} = useDispatch( 'core/editor' );

	const fetchReusableBlock = partial( fetchReusableBlocks, ref );
	const onChange = partial( updateReusableBlock, ref );
	const onSave = partial( saveReusableBlock, ref );

	const prevReusableBlock = usePrevious( theReusableBlock );

	// Start in edit mode when working with a newly created reusable block.
	// Start in preview mode when we're working with an existing reusable block.
	const [ isEditing, setIsEditing ] = useState( isTemporary ?? false );

	// Local state so changes can be made to the reusable block without having to save them.
	const [ localTitle, setLocalTitle ] = useState( title );
	const [ localBlocks, setLocalBlocks ] = useState( blocks ?? [] );

	useEffect( () => {
		if ( ! theReusableBlock ) {
			fetchReusableBlock();
		}
	}, [ theReusableBlock ] );

	useEffect( () => {
		if ( prevReusableBlock !== theReusableBlock && localTitle === null ) {
			setLocalTitle( title );
			setLocalBlocks( blocks );
		}
	}, [ localTitle, theReusableBlock ] );

	function startEditing() {
		setIsEditing( true );
		setLocalTitle( title );
		setLocalBlocks( blocks );
	}

	function stopEditing() {
		setIsEditing( false );
		setLocalTitle( null );
		setLocalBlocks( [] );
	}

	function setBlocks( updatedBlocks ) {
		setLocalBlocks( updatedBlocks );
	}

	function setTitle( updatedTitle ) {
		setLocalTitle( updatedTitle );
	}

	function save() {
		onChange( { title: localTitle, content: serialize( localBlocks ) } );
		onSave();
		stopEditing();
	}

	if ( ! theReusableBlock && isFetching ) {
		return (
			<Placeholder>
				<Spinner />
			</Placeholder>
		);
	}

	if ( ! theReusableBlock ) {
		return (
			<Placeholder>
				{ __( 'Block has been deleted or is unavailable.' ) }
			</Placeholder>
		);
	}

	let element = (
		<BlockEditorProvider
			settings={ settings }
			value={ localBlocks }
			onChange={ setBlocks }
			onInput={ setBlocks }
		>
			<WritingFlow>
				<BlockList />
			</WritingFlow>
		</BlockEditorProvider>
	);

	if ( ! isEditing ) {
		element = <Disabled>{ element }</Disabled>;
	}

	return (
		<div className="block-library-block__reusable-block-container">
			{ ( isSelected || isEditing ) && (
				<ReusableBlockEditPanel
					isEditing={ isEditing }
					title={ localTitle ?? title }
					isSaving={ isSaving && ! ( isTemporary ?? false ) }
					isEditDisabled={ ! canUpdateBlock }
					onEdit={ startEditing }
					onChangeTitle={ setTitle }
					onSave={ save }
					onCancel={ stopEditing }
				/>
			) }
			{ element }
		</div>
	);
}
