import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'

function TabPanel(props: any) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
        >
            {value === index && children}
        </div>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    }
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
}))

export interface TabProps {
    label: string
    child: JSX.Element
}

export default function SimpleTabs(props: { tabs: TabProps[] }) {
    const classes = useStyles()
    const [value, setValue] = React.useState(0)

    const handleChange = (event: any, newValue: number) => {
        setValue(newValue)
    }

    return (
        <div className={classes.root}>
            <Tabs
                value={value}
                onChange={handleChange}
                aria-label="simple tabs example"
            >
                {props.tabs.map((tab, index) => {
                    return (
                        <Tab
                            label={tab.label}
                            {...a11yProps(index)}
                            key={index}
                        />
                    )
                })}
            </Tabs>
            {props.tabs.map((tab, index) => {
                return (
                    <TabPanel value={value} index={index}>
                        {tab.child}
                    </TabPanel>
                )
            })}
        </div>
    )
}
