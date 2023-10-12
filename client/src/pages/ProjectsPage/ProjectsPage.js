import React, { Fragment } from 'react';
import styles from './ProjectsPage.module.css';
import RowItem from '../../components/RowItem/RowItem';

export default function ProjectsPage() {
    return (
        <Fragment>
            <h1 className="text-center mt-5">Projects Page</h1>
            <div className={styles.section_container}>
                <RowItem
                    title="This Is My HUge Huge Huge HUge Row"
                    subtitle="Sub title"
                    childRows={[
                        {
                            title: "This Is My Second Row",
                            subtitle: "New Sub title"
                        },
                    ]}
                />
            </div>
        </Fragment>
    );
}