import React from 'react'
import { Button, Icon, Modal, Input, Header, ModalContent, ModalActions, Grid, GridColumn, GridRow } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styles from './EditMetadataModel.css'
class EditMetadataModal extends React.Component {
    constructor(props) {
        super(props)
        this.numberOfCustomMetadata = 0
        // this.state = {};
    }

    // Add new metadata entry
    addItem() {
        this.numberOfCustomMetadata++
        console.log(this.numberOfCustomMetadata)
        ReactDOM.render(this.render(), document.getElementById('custom-metadata-container'))
    }

    //
    getResult(numberOfCustomMetadata) {
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

    render() {
        return <Modal
            closeIcon
            trigger={
                <Button
                    icon='edit'
                    onClick={e => { e.preventDefault() }}
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
                <Button color='red' negative onClick={e => { this.props.onEditButtonClick() }}>
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
