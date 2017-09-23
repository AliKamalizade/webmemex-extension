import React from 'react'
import { Button, Icon, Modal, Input, Header, ModalContent, ModalActions, Grid, GridColumn, GridRow } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styles from './EditMetadataModel.css'
// A dialog which contains stored metadata. New metadata can be added.
class EditMetadataModal extends React.Component {
    constructor(props) {
        super(props)
        this.numberOfCustomMetadata = 0
        this.pageTitle = document.title
        this.state = { modalOpen: false }
        this.handleModalOpen = this.handleModalOpen.bind(this)
        this.handleModalClose = this.handleModalClose.bind(this)
    }

    // Add new metadata entry
    addItem() {
        this.numberOfCustomMetadata++
        ReactDOM.render(this.getCustomMetadataList(this.numberOfCustomMetadata), document.getElementById('custom-metadata-container'))
    }

    // Create custom metadata list
    getCustomMetadataList(numberOfCustomMetadata) {
        const result = [...new Array(numberOfCustomMetadata)].map((el, i) =>
            <li key={i}>
                <Grid columns={2}>
                    <GridRow>
                        <GridColumn>
                            <Input
                                title={`New Metadata name`}
                                placeholder={`New Metadata name`}
                                defaultValue={'New metadata name'}
                            />
                        </GridColumn>
                        <GridColumn>
                            <Input
                                title={`New Metadata value`}
                                placeholder={`New Metadata value`}
                            />
                        </GridColumn>
                    </GridRow>
                </Grid>
            </li>
        )
        return <ul className={styles.cleanerListStyle}>{result}</ul>
    }

    handleModalOpen () {
        this.setState({modalOpen: true})
        document.title = 'Edit metadata'
    }

    handleModalClose () {
        this.setState({modalOpen: false})
        document.title = this.pageTitle
    }

    render() {
        return <Modal
            closeIcon
            open={this.state.modalOpen}
            onClose={this.handleModalClose}
            trigger={
                <Button
                    icon='edit'
                    onClick={e => { e.preventDefault(); this.handleModalOpen() }}
                    floated='right'
                    tabIndex='-1'
                    title={'Edit metadata of this page'}
                />
            }>
            <Header icon='edit' content='Edit metadata' />
            <ModalContent scrolling>
                <div>
                    <Input
                        fluid
                        icon='search'
                        iconPosition='left'
                        title='Edit title'
                        placeholder='Title'
                        defaultValue={this.props.doc.page.title}
                    />
                    <Input
                        fluid
                        icon='comment'
                        iconPosition='left'
                        title='Edit description'
                        placeholder={`Description`}
                        defaultValue={this.props.doc.page.content? this.props.doc.page.content.description : null}
                    />
                    <Input
                        fluid
                        icon='world'
                        iconPosition='left'
                        placeholder='URL'
                        title={`Edit URL`}
                        type='url'
                        defaultValue={this.props.doc.page.url}
                    />
                    <Input
                        fluid
                        icon='tags'
                        iconPosition='left'
                        placeholder={`Keywords`}
                        title={`Edit keywords`}
                        defaultValue={this.props.doc.page.content? this.props.doc.page.content.keywords : null}
                    />
                    <h5>Custom metadata</h5>
                    <div id='custom-metadata-container' />
                    <Button color='green' onClick={e => { this.addItem() }}>
                        <Icon name='add' title={'Add new custom metadata'} /> Add
                    </Button>
                </div>
            </ModalContent>
            <ModalActions>
                <Button color='red' negative onClick={this.handleModalClose}>
                    <Icon name='remove' /> Cancel
                </Button>
                <Button color='green' positive onClick={e => { this.props.onEditButtonClick() }}>
                    <Icon name='checkmark' /> Save
                </Button>
            </ModalActions>
        </Modal>
    }
}
EditMetadataModal.propTypes = {
    doc: PropTypes.object,
    onEditButtonClick: PropTypes.func,
}
export default EditMetadataModal
