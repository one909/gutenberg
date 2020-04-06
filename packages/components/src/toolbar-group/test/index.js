/**
 * External dependencies
 */
import { render } from '@testing-library/react';

/**
 * Internal dependencies
 */
import ToolbarGroup from '../';

describe( 'ToolbarGroup', () => {
	describe( 'basic rendering', () => {
		it( 'should render an empty node, when controls are not passed', () => {
			const { container } = render( <ToolbarGroup /> );
			expect( container.innerHTML ).toBe( '' );
		} );

		it( 'should render an empty node, when controls are empty', () => {
			const { container } = render( <ToolbarGroup controls={ [] } /> );
			expect( container.innerHTML ).toBe( '' );
		} );

		it( 'should render a list of controls with buttons', () => {
			const clickHandler = ( event ) => event;
			const controls = [
				{
					icon: 'wordpress',
					title: 'WordPress',
					onClick: clickHandler,
					isActive: false,
				},
			];
			const { getByLabelText } = render(
				<ToolbarGroup controls={ controls } />
			);

			const toolbarButton = getByLabelText( 'WordPress' );
			expect( toolbarButton.getAttribute( 'aria-pressed' ) ).toBe(
				'false'
			);
			expect( toolbarButton.getAttribute( 'type' ) ).toBe( 'button' );
		} );

		it( 'should render a list of controls with buttons and active control', () => {
			const clickHandler = ( event ) => event;
			const controls = [
				{
					icon: 'wordpress',
					title: 'WordPress',
					onClick: clickHandler,
					isActive: true,
				},
			];
			const { getByLabelText } = render(
				<ToolbarGroup controls={ controls } />
			);

			const toolbarButton = getByLabelText( 'WordPress' );
			expect( toolbarButton.getAttribute( 'aria-pressed' ) ).toBe(
				'true'
			);
			expect( toolbarButton.getAttribute( 'type' ) ).toBe( 'button' );
		} );

		it( 'should render a nested list of controls with separator between', () => {
			const controls = [
				[
					// First set
					{
						icon: 'wordpress',
						title: 'WordPress',
					},
				],
				[
					// Second set
					{
						icon: 'wordpress',
						title: 'WordPress',
					},
				],
			];

			const { getAllByRole } = render(
				<ToolbarGroup controls={ controls } />
			);
			const buttons = getAllByRole( 'button' );
			expect( buttons ).toHaveLength( 2 );
			// const hasLeftDivider = getAllByRole( '.has-left-divider' );
			// expect( hasLeftDivider ).toHaveLength( 1 );
			// expect( hasLeftDivider.html() ).toContain( buttons.at( 1 ).html() );
		} );

		/* it( 'should call the clickHandler on click.', () => {
			const clickHandler = jest.fn();
			const controls = [
				{
					icon: 'wordpress',
					title: 'WordPress',
					onClick: clickHandler,
					isActive: true,
				},
			];
			const { getBySelector } = render(
				<ToolbarGroup controls={ controls } />
			);
			fireEvent.click( getBySelector( '[aria-label="WordPress"]' ) );
			expect( clickHandler ).toHaveBeenCalledTimes( 1 );
		} ); */
	} );
} );
