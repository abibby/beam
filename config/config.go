package config

import (
	"encoding/json"
	"io/ioutil"
)

type Connection struct {
	Driver string `json:"driver"`
	Source string `json:"source"`
}

type Config struct {
	Connections map[string]*Connection `json:"connections"`
}

var _config *Config
var _path string

func Load(path string) error {
	_config = &Config{}
	_path = path

	b, err := ioutil.ReadFile(path)
	if err != nil {
		return err
	}

	err = json.Unmarshal(b, _config)
	if err != nil {
		return err
	}

	return nil
}

func Get() *Config {
	return _config
}
