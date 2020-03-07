import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative"
  },
  resizing: {
    transition: "unset !important"
  },
  dragger: {
    width: 5,
    height: "100%",
    position: "absolute",
    cursor: "ew-resize",
    userSelect: "none",
    zIndex: 2
  },
  topDragger: {
    /* TODO */
  },
  rightDragger: {
    /* TODO */
  },
  bottomDragger: {
    /* TODO */
  },
  leftDragger: {
    top: 0,
    bottom: 0,
    left: 0
  }
}));

export default function Resizeable(props) {
  const {
    className,
    style,
    children,
    top,
    right,
    bottom,
    left,
    onResize,
    ...other
  } = props;

  const classes = useStyles();

  const [resizing, setResizing] = React.useState(false);
  const [resized, setResized] = React.useState(style);

  const handleMouseDown = React.useCallback(
    e => {
      setResizing(true);
    },
    [resizing]
  );

  const handleMouseUp = React.useCallback(
    e => {
      setResizing(false);
    },
    [resizing]
  );

  const handleMouseMove = React.useCallback(
    e => {
      if (resizing) {
        let offsetRight =
          document.body.offsetWidth - (e.clientX - document.body.offsetLeft);
        let minWidth = 160;
        let maxWidth = 600;
        if (offsetRight > minWidth && offsetRight < maxWidth) {
          setResized({ ...style, width: offsetRight });
          onResize(offsetRight);
        }
      }
    },
    [resizing]
  );

  React.useEffect(() => {
    setResized(style);
  }, [style]);

  React.useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [resizing]);

  const topDragger = top ? (
    <div
      id="top-dragger"
      className={clsx(classes.dragger, { [classes.topDragger]: top })}
      onMouseDown={handleMouseDown}
    />
  ) : null;
  const rightDragger = right ? (
    <div
      id="right-dragger"
      className={clsx(classes.dragger, { [classes.rightDragger]: right })}
      onMouseDown={handleMouseDown}
    />
  ) : null;
  const bottomDragger = bottom ? (
    <div
      id="bottom-dragger"
      className={clsx(classes.dragger, { [classes.bottomDragger]: bottom })}
      onMouseDown={handleMouseDown}
    />
  ) : null;
  const leftDragger = left ? (
    <div
      id="left-dragger"
      className={clsx(classes.dragger, { [classes.leftDragger]: left })}
      onMouseDown={handleMouseDown}
    />
  ) : null;

  return (
    <div
      className={clsx(classes.root, className, {
        [classes.resizing]: resizing
      })}
      style={resized}
    >
      {topDragger}
      {rightDragger}
      {bottomDragger}
      {leftDragger}
      {children}
    </div>
  );
}

Resizeable.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  top: PropTypes.bool,
  right: PropTypes.bool,
  bottom: PropTypes.bool,
  left: PropTypes.bool,
  onResize: PropTypes.func
};
