import get from 'lodash/fp/get'
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Popup, Icon, Modal, Input, Header, ModalContent, ModalActions, Grid, GridColumn, GridRow } from 'semantic-ui-react'
import classNames from 'classnames'

import { hrefForLocalPage } from 'src/page-viewer'
import niceTime from 'src/util/nice-time'

import ImgFromPouch from './ImgFromPouch'
import styles from './VisitAsListItem.css'
import {deleteVisit, editVisit} from '../actions'
import ReactDOM from 'react-dom'
// import Cite from "citation-js"

const VisitAsListItem = ({doc, compact, onTrashButtonClick, onEditButtonClick}) => {
    const href = hrefForLocalPage({page: doc.page})

    // const cited = new Cite('Q21972834')
    // const output = cited.get({
    //     format: 'string',
    //     type: 'html',
    //     style: 'citation-apa',
    //     lang: 'en-US',
    // })
    // console.log(output)

    const pageSize = get(['_attachments', 'frozen-page.html', 'length'])(doc.page)
    const sizeInMB = pageSize !== undefined
        ? Math.round(pageSize / 1024**2 * 10) / 10
        : 0

    const visitClasses = classNames({
        [styles.root]: true,
        [styles.compact]: compact,
        [styles.available]: !!href,
    })

    let numberOfCustomMetadata = 0

    //
    function getResult() {
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

    // Add new metadata entry
    function addItem() {
        numberOfCustomMetadata++
        ReactDOM.render(getResult(), document.getElementById('custom-metadata-container'))
    }

    const hasFavIcon = !!(doc.page._attachments && doc.page._attachments.favIcon)
    const actionsContainer = (
        <div>
            {/* TODO Modal dialog */}
            <Modal
                closeIcon
                trigger={
                    <Button
                        icon='edit'
                        onClick={e => { e.preventDefault() }}
                        floated='right'
                        tabIndex='-1'
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
                            defaultValue={doc.page.title}
                        />
                        <Input
                            fluid
                            icon='comment'
                            iconPosition='left'
                            title='Edit description'
                            placeholder={`Description`}
                            defaultValue={doc.page.content? doc.page.content.description : null}
                        />
                        <Input
                            fluid
                            icon='world'
                            iconPosition='left'
                            placeholder='URL'
                            title={`Edit URL`}
                            type='url'
                            defaultValue={doc.page.url}
                        />
                        <Input
                            fluid
                            icon='tags'
                            iconPosition='left'
                            placeholder={`Keywords`}
                            title={`Edit keywords`}
                            defaultValue={doc.page.content? doc.page.content.keywords : null}
                        />
                        <h5>Custom metadata</h5>
                        <div id='custom-metadata-container' />
                        <Button color='green' onClick={e => { addItem() }}>
                            <Icon name='add' title={'Add new custom metadata'} /> Add
                        </Button>
                    </div>
                </ModalContent>
                <ModalActions>
                    <Button color='red' onClick={e => { onEditButtonClick() }}>
                        <Icon name='remove' /> Cancel
                    </Button>
                    <Button color='green' onClick={e => { onEditButtonClick() }}>
                        <Icon name='checkmark' /> Save
                    </Button>
                </ModalActions>
            </Modal>
            <Popup
                trigger={
                    <Button
                        icon='delete'
                        onClick={e => { e.preventDefault() }}
                        floated='right'
                        tabIndex='-1'
                    />
                }
                content={
                    <Button
                        negative
                        content={`Forget this item`}
                        onClick={e => { onTrashButtonClick() }}
                        title={`Stored page size: ${sizeInMB} MB`}
                    />
                }
                on='focus'
                hoverable
                position='right center'
            />
        </div>
    )

    const favIcon = hasFavIcon
        ? (
            <ImgFromPouch
                className={styles.favIcon}
                doc={doc.page}
                attachmentId='favIcon'
            />
        )
        : <Icon size='big' name='file outline' className={styles.favIcon} />

    return (
        <a
            href={href}
            title={href ? undefined : `Page not available. Perhaps storing failed?`}
            className={visitClasses}
            // DEBUG Show document props on ctrl+meta+click
            onClick={e => { if (e.metaKey && e.ctrlKey) { console.log(doc); e.preventDefault() } }}
            onKeyPress={e => { if (e.key==='Delete') { onTrashButtonClick() } else if (e.key==='Edit') { onEditButtonClick() } }}
        >
            <div className={styles.screenshotContainer}>
                {doc.page._attachments && doc.page._attachments.screenshot
                    ? (
                        <ImgFromPouch
                            className={styles.screenshot}
                            doc={doc.page}
                            attachmentId='screenshot'
                        />
                    )
                    : favIcon
                }
            </div>
            <div className={styles.descriptionContainer}>
                <div
                    className={styles.title}
                >
                    {hasFavIcon && favIcon}
                    <span title={doc.page.title}>
                        {doc.page.title}
                    </span>
                </div>
                <div className={styles.url}>
                    <a
                        href={doc.page.url}
                    >
                        {doc.page.url}
                    </a>
                </div>
                <div className={styles.time}>{niceTime(doc.visitStart)}</div>
            </div>
            <div className={styles.buttonsContainer}>
                {actionsContainer}
            </div>
        </a>
    )
}

VisitAsListItem.propTypes = {
    doc: PropTypes.object.isRequired,
    compact: PropTypes.bool,
    onTrashButtonClick: PropTypes.func,
    onEditButtonClick: PropTypes.func,
}


const mapStateToProps = state => ({})

const mapDispatchToProps = (dispatch, {doc}) => ({
    onTrashButtonClick: () => dispatch(deleteVisit({visitId: doc._id})),
    onEditButtonClick: () => {
        console.log(doc)
        return dispatch(editVisit({visitId: doc._id}))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(VisitAsListItem)
