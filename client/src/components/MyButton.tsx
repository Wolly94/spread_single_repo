import React from 'react'
import clsx from 'clsx'
import Button, { ButtonProps } from '@material-ui/core/Button'
import { withStyles, WithStyles } from '@material-ui/core/styles'

interface Props extends WithStyles<typeof styles> {
    children?: React.ReactNode
    className?: string
}

// We can inject some CSS into the DOM.
const styles = {
    root: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        borderRadius: 3,
        border: 0,
        color: 'white',
        height: 72,
        width: 256,
        padding: '0 30px',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    },
}

const ClassNames: React.FC<ButtonProps & Props> = (props) => {
    const { classes, children, className, ...other } = props

    return (
        <Button className={clsx(classes.root, className)} {...other}>
            {children || 'class names'}
        </Button>
    )
}

const MyButton = withStyles(styles)(ClassNames)

export default MyButton
